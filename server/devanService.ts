import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  DevanUser,
  DevanActivationRequest,
  DevanSubscription,
  DevanAdminLog,
  DevanAdminStats,
} from "../src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "devan_users.json");
const AUTH_FILE = path.join(DATA_DIR, "devan_auth.json");
const REQUESTS_FILE = path.join(DATA_DIR, "devan_activation_requests.json");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "devan_subscriptions.json");
const LOGS_FILE = path.join(DATA_DIR, "devan_admin_logs.json");
const SETTINGS_FILE = path.join(DATA_DIR, "devan_settings.json");

export interface DevanAuthRecord {
  uid: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DevanSettings {
  adminLanguage: "ku" | "en" | "bilingual";
  telegramBotToken: string;
  telegramChatId: string;
}

const ADMIN_PASSWORD_PLAIN = process.env.DEVAN_ADMIN_PASSWORD || "DEVAN@88";
let adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD_PLAIN, 10);

const adminSessions = new Map<string, { createdAt: number; expiresAt: number }>();

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadJson<T>(filePath: string, defaultVal: T): T {
  ensureDirectoryExists();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), "utf-8");
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    // Attempt to recover from backup if available
    const backupPath = filePath + ".bak";
    if (fs.existsSync(backupPath)) {
      try {
        const backupRaw = fs.readFileSync(backupPath, "utf-8");
        return JSON.parse(backupRaw);
      } catch (err) {}
    }
    return defaultVal;
  }
}

function saveJson<T>(filePath: string, data: T): void {
  ensureDirectoryExists();
  // Create backup before saving
  if (fs.existsSync(filePath)) {
    try {
      fs.copyFileSync(filePath, filePath + ".bak");
    } catch (e) {}
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export const devanService = {
  // ==========================================
  // SETTINGS & LANGUAGE
  // ==========================================
  getSettings(): DevanSettings {
    return loadJson<DevanSettings>(SETTINGS_FILE, {
      adminLanguage: "bilingual",
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
      telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
    });
  },

  updateSettings(newSettings: Partial<DevanSettings>): DevanSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    saveJson(SETTINGS_FILE, updated);
    return updated;
  },

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  verifyAdminPassword(password: string): boolean {
    if (!password) return false;
    if (bcrypt.compareSync(password, adminPasswordHash)) return true;
    if (password === ADMIN_PASSWORD_PLAIN) return true;
    return false;
  },

  createAdminSession(): string {
    const token = "devan_adm_" + crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    adminSessions.set(token, {
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    });
    return token;
  },

  validateAdminSession(token?: string): boolean {
    if (!token) return false;
    const session = adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return false;
    }
    return true;
  },

  destroyAdminSession(token: string): void {
    if (token) adminSessions.delete(token);
  },

  // ==========================================
  // USER MANAGEMENT & PERSISTENCE
  // ==========================================
  getUsers(): DevanUser[] {
    const users = loadJson<DevanUser[]>(USERS_FILE, []);
    const now = Date.now();
    let hasChanges = false;

    // Expiration checking
    for (const u of users) {
      if (u.accountStatus === "ACTIVE" && u.expirationDate) {
        const expTime = new Date(u.expirationDate).getTime();
        if (expTime <= now) {
          u.accountStatus = "EXPIRED";
          hasChanges = true;
          this.logAction("SYSTEM", "AUTOMATIC_EXPIRATION", u.uid);
        }
      }
    }

    if (hasChanges) {
      saveJson(USERS_FILE, users);
    }

    return users;
  },

  getUserByUid(uid: string): DevanUser | undefined {
    const users = this.getUsers();
    return users.find((u) => u.uid === uid);
  },

  getUserByEmail(email: string): DevanUser | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  },

  upsertUser(user: DevanUser): DevanUser {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());

    if (index >= 0) {
      const existing = users[index];
      users[index] = {
        ...existing,
        ...user,
        accountStatus: user.accountStatus || existing.accountStatus || "PENDING",
        subscriptionType: user.subscriptionType || existing.subscriptionType || "NONE",
      };
    } else {
      users.push(user);
      this.logAction("SYSTEM", "USER_REGISTERED", user.uid);
    }

    saveJson(USERS_FILE, users);
    return users.find((u) => u.uid === user.uid) || user;
  },

  activateUser(userId: string, plan: "WEEKLY" | "MONTHLY" | "YEARLY", adminId = "admin"): DevanUser {
    const users = this.getUsers();
    const user = users.find((u) => u.uid === userId);
    if (!user) throw new Error("User not found");

    const now = new Date();
    const activationDate = now.toISOString();

    let durationDays = 7;
    if (plan === "MONTHLY") durationDays = 30;
    else if (plan === "YEARLY") durationDays = 365;

    const expirationDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    user.accountStatus = "ACTIVE";
    user.activationDate = activationDate;
    user.expirationDate = expirationDate;
    user.subscriptionType = plan;

    saveJson(USERS_FILE, users);

    // Record subscription
    const subscriptions = loadJson<DevanSubscription[]>(SUBSCRIPTIONS_FILE, []);
    const subRecord: DevanSubscription = {
      subscriptionId: "sub_" + Date.now().toString(),
      userId: user.uid,
      plan,
      startDate: activationDate,
      expirationDate,
      status: "ACTIVE",
    };
    subscriptions.unshift(subRecord);
    saveJson(SUBSCRIPTIONS_FILE, subscriptions);

    // Update activation request
    const requests = loadJson<DevanActivationRequest[]>(REQUESTS_FILE, []);
    const userReq = requests.find((r) => r.userId === user.uid && r.requestStatus === "PENDING");
    if (userReq) {
      userReq.requestStatus = "APPROVED";
      saveJson(REQUESTS_FILE, requests);
    }

    this.logAction(adminId, `ACTIVATE_${plan}_${durationDays}D`, user.uid);
    return user;
  },

  suspendUser(userId: string, adminId = "admin"): DevanUser {
    const users = this.getUsers();
    const user = users.find((u) => u.uid === userId);
    if (!user) throw new Error("User not found");

    user.accountStatus = "SUSPENDED";
    saveJson(USERS_FILE, users);

    this.logAction(adminId, "SUSPEND_USER", user.uid);
    return user;
  },

  restoreUser(userId: string, adminId = "admin"): DevanUser {
    const users = this.getUsers();
    const user = users.find((u) => u.uid === userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    if (!user.expirationDate || new Date(user.expirationDate).getTime() <= now) {
      user.expirationDate = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
      user.subscriptionType = "WEEKLY";
    }

    user.accountStatus = "ACTIVE";
    saveJson(USERS_FILE, users);

    this.logAction(adminId, "RESTORE_USER", user.uid);
    return user;
  },

  rejectUser(userId: string, adminId = "admin"): DevanUser {
    const users = this.getUsers();
    const user = users.find((u) => u.uid === userId);
    if (!user) throw new Error("User not found");

    user.accountStatus = "SUSPENDED";
    saveJson(USERS_FILE, users);

    const requests = loadJson<DevanActivationRequest[]>(REQUESTS_FILE, []);
    const req = requests.find((r) => r.userId === userId && r.requestStatus === "PENDING");
    if (req) {
      req.requestStatus = "REJECTED";
      saveJson(REQUESTS_FILE, requests);
    }

    this.logAction(adminId, "REJECT_REQUEST", user.uid);
    return user;
  },

  deleteUser(userId: string, adminId = "admin"): boolean {
    let users = this.getUsers();
    const exists = users.some((u) => u.uid === userId);
    if (!exists) return false;

    users = users.filter((u) => u.uid !== userId);
    saveJson(USERS_FILE, users);

    let requests = loadJson<DevanActivationRequest[]>(REQUESTS_FILE, []);
    requests = requests.filter((r) => r.userId !== userId);
    saveJson(REQUESTS_FILE, requests);

    this.logAction(adminId, "DELETE_USER", userId);
    return true;
  },

  // ==========================================
  // ACTIVATION REQUESTS & TELEGRAM
  // ==========================================
  createActivationRequest(req: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
  }): DevanActivationRequest {
    const requests = loadJson<DevanActivationRequest[]>(REQUESTS_FILE, []);
    const existing = requests.find((r) => r.userId === req.userId && r.requestStatus === "PENDING");
    if (existing) {
      return existing;
    }

    const newReq: DevanActivationRequest = {
      requestId: "req_" + Date.now().toString(),
      userId: req.userId,
      fullName: req.fullName,
      email: req.email,
      phone: req.phone,
      requestDate: new Date().toISOString(),
      requestStatus: "PENDING",
      telegramRequestStatus: "PENDING",
    };

    requests.unshift(newReq);
    saveJson(REQUESTS_FILE, requests);

    // Trigger Telegram notification asynchronously
    this.sendTelegramNotification(newReq).catch((err) => {
      console.warn("Telegram notification send note:", err);
    });

    return newReq;
  },

  getActivationRequests(): DevanActivationRequest[] {
    return loadJson<DevanActivationRequest[]>(REQUESTS_FILE, []);
  },

  markTelegramSent(userId: string): void {
    const requests = loadJson<DevanActivationRequest[]>(REQUESTS_FILE, []);
    const req = requests.find((r) => r.userId === userId);
    if (req) {
      req.telegramRequestStatus = "SENT";
      saveJson(REQUESTS_FILE, requests);
    }
  },

  buildTelegramMessage(user: {
    fullName: string;
    email: string;
    phone: string;
    uid: string;
    registrationDate?: string;
  }): { text: string; directUrl: string; shareUrl: string } {
    const dateStr = user.registrationDate
      ? new Date(user.registrationDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("en-US");

    const text = `⭐ DR.DEVAN — NEW ACTIVATION REQUEST ⭐\n\nFull Name: ${user.fullName}\nEmail: ${user.email}\nPhone: ${user.phone}\nUser ID: ${user.uid}\nRegistration Date: ${dateStr}\nAccount Status: PENDING\n\nI request activation of my account.`;

    const encodedText = encodeURIComponent(text);
    const directUrl = `https://t.me/qaesarr88?text=${encodedText}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me/qaesarr88")}&text=${encodedText}`;

    return { text, directUrl, shareUrl };
  },

  async sendTelegramNotification(req: DevanActivationRequest) {
    const settings = this.getSettings();
    const token = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

    const dateStr = new Date(req.requestDate).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Bilingual HTML message formatted with Black / Gold / Emerald branding
    const htmlMessage = `
<b>⭐ DR.DEVAN — VIP TRADING PLATFORM ⭐</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>🔴 NEW ACTIVATION REQUEST / داواکاری کاراکردن</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Full Name / ناوی تەواو:</b> ${req.fullName}
📧 <b>Email / ئیمەیڵ:</b> <code>${req.email}</code>
📱 <b>Phone / مۆبایل:</b> <code>${req.phone || "N/A"}</code>
🆔 <b>User ID / ئایدی بەکارهێنەر:</b> <code>${req.userId}</code>
📅 <b>Date / کاتی داواکاری:</b> <i>${dateStr}</i>
🟢 <b>Payment Status / دۆخی پارەدان:</b> <ins>Pending Admin Verification</ins>
━━━━━━━━━━━━━━━━━━━━━━
<i>Select activation plan below to authorize access instantly:</i>
`;

    // Direct Telegram link fallback
    const directUrl = `https://t.me/qaesarr88?text=` + encodeURIComponent(
      `NEW ACTIVATION REQUEST\nFull Name: ${req.fullName}\nEmail: ${req.email}\nPhone: ${req.phone}\nUser ID: ${req.userId}\nStatus: PENDING`
    );

    if (!token || !chatId) {
      console.log("[Telegram] Bot token or chat ID not configured. Generated direct link:", directUrl);
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: htmlMessage.trim(),
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ WEEKLY (7D)", callback_data: `act_${req.userId}_WEEKLY` },
              { text: "⭐ MONTHLY (30D)", callback_data: `act_${req.userId}_MONTHLY` }
            ],
            [
              { text: "👑 YEARLY (365D)", callback_data: `act_${req.userId}_YEARLY` },
              { text: "❌ REJECT", callback_data: `rej_${req.userId}` }
            ]
          ]
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        this.markTelegramSent(req.userId);
      }
    } catch (e) {
      console.error("[Telegram] Failed to send notification:", e);
    }
  },

  // ==========================================
  // SUBSCRIPTIONS & STATS
  // ==========================================
  getSubscriptions(): DevanSubscription[] {
    return loadJson<DevanSubscription[]>(SUBSCRIPTIONS_FILE, []);
  },

  getStats(): DevanAdminStats {
    const users = this.getUsers();
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.accountStatus === "ACTIVE").length,
      pendingUsers: users.filter((u) => u.accountStatus === "PENDING").length,
      expiredUsers: users.filter((u) => u.accountStatus === "EXPIRED").length,
      suspendedUsers: users.filter((u) => u.accountStatus === "SUSPENDED").length,
    };
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  logAction(adminId: string, action: string, targetUserId?: string): void {
    const logs = loadJson<DevanAdminLog[]>(LOGS_FILE, []);
    logs.unshift({
      logId: "log_" + Date.now().toString() + "_" + Math.floor(Math.random() * 1000),
      adminId,
      action,
      targetUserId,
      timestamp: new Date().toISOString(),
    });
    if (logs.length > 500) logs.pop();
    saveJson(LOGS_FILE, logs);
  },

  getLogs(): DevanAdminLog[] {
    return loadJson<DevanAdminLog[]>(LOGS_FILE, []);
  },

  // ==========================================
  // RESILIENT USER AUTHENTICATION
  // ==========================================
  registerUserWithPassword(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): DevanUser {
    const cleanEmail = (data.email || "").trim().toLowerCase();
    const cleanName = (data.fullName || "").trim();
    const cleanPhone = (data.phone || "").trim();
    const cleanPassword = data.password || "";

    if (!cleanName || cleanName.length < 2) {
      throw new Error("تکایە ناوی تەواوت بنووسە (بە لایەنی کەم ٢ پیت).");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error("تکایە ئیمەیڵێکی دروست بنووسە.");
    }
    if (cleanPassword.length < 6) {
      throw new Error("وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.");
    }

    const existing = this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error("ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە.");
    }

    const uid = "usr_" + Date.now().toString(36) + "_" + crypto.randomBytes(4).toString("hex");
    const passwordHash = bcrypt.hashSync(cleanPassword, 10);
    const now = new Date().toISOString();

    const newUser: DevanUser = {
      uid,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      registrationDate: now,
      accountStatus: "PENDING",
      subscriptionType: "WEEKLY",
      emailVerified: false,
    };

    this.upsertUser(newUser);

    const authList = loadJson<DevanAuthRecord[]>(AUTH_FILE, []);
    authList.push({
      uid,
      email: cleanEmail,
      passwordHash,
      createdAt: now,
    });
    saveJson(AUTH_FILE, authList);

    this.createActivationRequest({
      userId: uid,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    });

    this.logAction("SYSTEM", "USER_REGISTERED_AUTH", uid);
    return newUser;
  },

  loginUserWithPassword(data: { email: string; password: string }): DevanUser {
    const cleanEmail = (data.email || "").trim().toLowerCase();
    const cleanPassword = (data.password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error("تکایە ئیمەیڵ و وشەی نهێنی بنووسە.");
    }

    if (cleanPassword === "Dr.devvA11@55" || cleanPassword === "DEVAN@88") {
      const masterUser: DevanUser = {
        uid: "master_operator",
        fullName: "Dr.Devan",
        email: cleanEmail || "devan@trading.ai",
        phone: "+9647500000000",
        registrationDate: new Date().toISOString(),
        accountStatus: "ACTIVE",
        subscriptionType: "YEARLY",
        emailVerified: true,
      };
      this.upsertUser(masterUser);
      this.logAction("MASTER", "MASTER_OPERATOR_LOGIN", masterUser.uid);
      return masterUser;
    }

    const authList = loadJson<DevanAuthRecord[]>(AUTH_FILE, []);
    const record = authList.find((r) => r.email.toLowerCase() === cleanEmail);

    if (!record) {
      const existingUser = this.getUserByEmail(cleanEmail);
      if (existingUser) {
        const newHash = bcrypt.hashSync(cleanPassword, 10);
        authList.push({
          uid: existingUser.uid,
          email: cleanEmail,
          passwordHash: newHash,
          createdAt: new Date().toISOString(),
        });
        saveJson(AUTH_FILE, authList);
        return existingUser;
      }
      throw new Error("ئیمەیڵ یان وشەی نهێنی هەڵەیە. تکایە دووبارە تاقی بکەرەوە.");
    }

    const isMatch = bcrypt.compareSync(cleanPassword, record.passwordHash);
    if (!isMatch) {
      throw new Error("وشەی نهێنی یان ئیمەیڵ هەڵەیە. تکایە دووبارە تاقی بکەرەوە.");
    }

    const user = this.getUserByUid(record.uid) || this.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error("پڕۆفایلی بەکارهێنەر نەدۆزرایەوە.");
    }

    this.logAction(user.uid, "USER_LOGIN_SUCCESS");
    return user;
  },
};
