import { Router, Response } from "express";
import crypto from "crypto";
import { db, DBUser, DBGeneration, DBSubscription, DBNotification, DBSupportRequest } from "./db";
import {
  requireAuth,
  AuthenticatedRequest,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogin,
} from "./auth";
import { generateAIImage } from "./imageGen";
import { notifyAdminSubscriptionRequest, notifyAdminContactMessage } from "./telegram";

export const apiRouter = Router();

function sanitizeUser(u: DBUser) {
  const activeSub = db.getActiveSubscription(u.id);
  let remainingDays = 0;
  if (activeSub && activeSub.expiry_date) {
    const diffMs = new Date(activeSub.expiry_date).getTime() - Date.now();
    remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    id: u.id,
    full_name: u.full_name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    balance: u.balance,
    free_ai_credits: u.free_ai_credits,
    account_status: u.account_status,
    language: u.language,
    profile_image: u.profile_image,
    two_factor_enabled: u.two_factor_enabled,
    recovery_codes: u.recovery_codes,
    created_at: u.created_at,
    updated_at: u.updated_at,
    active_subscription: activeSub
      ? {
          ...activeSub,
          remaining_days: remainingDays,
        }
      : null,
  };
}

// ==========================================
// 1. HEALTH & SYSTEM CHECK
// ==========================================
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "2.5.0",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    ai_status: process.env.GEMINI_API_KEY ? "CONFIGURED" : "READY_DEV",
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
apiRouter.get("/auth/me", (req: AuthenticatedRequest, res: Response) => {
  let token = req.cookies?.user_session;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.json({ user: null });
  }

  const session = db.getSession(token);
  if (!session) {
    res.clearCookie("user_session");
    return res.json({ user: null });
  }

  const user = db.getUserById(session.user_id);
  if (!user || user.account_status === "DISABLED") {
    res.clearCookie("user_session");
    return res.json({ user: null });
  }

  res.json({ user: sanitizeUser(user) });
});

apiRouter.post("/auth/register", async (req, res) => {
  try {
    const { full_name, username, email, phone, password, language } = req.body || {};

    if (!full_name || !username || !email || !password) {
      return res.status(400).json({ error: "تکایە هەموو خانە پێویستەکان پڕبکەرەوە (All fields required)." });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // Check existing
    const existing = db.getUserByEmailOrUsername(cleanUsername) || db.getUserByEmailOrUsername(cleanEmail);
    if (existing) {
      return res.status(400).json({
        error: "ئەم بەکارهێنەرە یان ئیمەیڵە پێشتر تۆمارکراوە (Username or Email already registered).",
      });
    }

    // Validate password
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.reason });
    }

    const password_hash = await hashPassword(password);
    const now = new Date().toISOString();

    const newUser: DBUser = {
      id: crypto.randomBytes(8).toString("hex"),
      full_name: String(full_name).trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: String(phone || "").trim(),
      password_hash,
      balance: 0,
      free_ai_credits: 4, // 4 welcome credits
      account_status: "ACTIVE",
      language: language || "ku_so",
      two_factor_enabled: false,
      created_at: now,
      updated_at: now,
    };

    db.createUser(newUser);

    // Initial welcome notification
    db.addNotification({
      id: crypto.randomBytes(8).toString("hex"),
      user_id: newUser.id,
      title: "بەخێربێیت بۆ Dr.Devan AI",
      message: "ئەژمێرەکەت بە سەرکەوتوویی دروستکرا. ٤ کرێدیتی بێبەرامبە بۆ بەرهەمهێنانی وێنە پێشکەشت کراوە.",
      type: "success",
      read: false,
      created_at: now,
    });

    const session = db.createSession(newUser.id, true);
    res.cookie("user_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: sanitizeUser(newUser),
      sessionToken: session.token,
    });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "هەڵەیەک لە دروستکردنی ئەژمێر ڕوویدا." });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body || {};
    const ip = req.ip || "unknown";

    if (!identifier || !password) {
      return res.status(400).json({ error: "تکایە ناوی بەکارهێنەر و وشەی نهێنی بنووسە." });
    }

    // Rate limit check
    const rateCheck = checkLoginRateLimit(ip);
    if (rateCheck.locked) {
      return res.status(429).json({
        error: `هەوڵی زۆر دراوە. تکایە ${rateCheck.remainingMinutes} خولەکی تر هەوڵبدەرەوە.`,
      });
    }

    const user = db.getUserByEmailOrUsername(identifier);
    if (!user) {
      const lockStatus = recordFailedLogin(ip);
      return res.status(401).json({
        error: "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە.",
        remainingAttempts: lockStatus.remainingAttempts,
      });
    }

    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      const lockStatus = recordFailedLogin(ip);
      return res.status(401).json({
        error: "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە.",
        remainingAttempts: lockStatus.remainingAttempts,
      });
    }

    if (user.account_status === "DISABLED") {
      return res.status(403).json({
        error: "ACCOUNT_DISABLED",
        message: "ئەژمێرەکەت ڕاگیراوە. تکایە پەیوەندی بە بەڕێوەبەرەوە بکە.",
      });
    }

    clearFailedLogin(ip);

    const session = db.createSession(user.id, Boolean(rememberMe));
    res.cookie("user_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: sanitizeUser(user),
      sessionToken: session.token,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "هەڵەیەک لە چوونەژوورەوە ڕوویدا." });
  }
});

apiRouter.post("/auth/logout", (req: AuthenticatedRequest, res) => {
  const token = req.cookies?.user_session || (req.headers.authorization?.split(" ")[1] ?? "");
  if (token) {
    db.deleteSession(token);
  }
  res.clearCookie("user_session");
  res.json({ success: true });
});

apiRouter.post("/auth/logout-all", requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    db.deleteAllSessionsForUser(req.user.id);
  }
  res.clearCookie("user_session");
  res.json({ success: true });
});

apiRouter.post("/auth/change-password", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "تکایە وشەی نهێنی ئێستا و نوێ بنووسە." });
    }

    const user = req.user!;
    const isCurrentValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({ error: "وشەی نهێنی ئێستا هەڵەیە." });
    }

    const pwdCheck = validatePasswordStrength(newPassword);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.reason });
    }

    const newHash = await hashPassword(newPassword);
    db.updateUser(user.id, { password_hash: newHash });

    db.addNotification({
      id: crypto.randomBytes(8).toString("hex"),
      user_id: user.id,
      title: "گۆڕینی وشەی نهێنی",
      message: "وشەی نهێنی ئەژمێرەکەت بە سەرکەوتوویی نوێکرایەوە.",
      type: "info",
      read: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "کێشەیەک لە گۆڕینی وشەی نهێنی ڕوویدا." });
  }
});

apiRouter.post("/auth/2fa/toggle", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const newStatus = !user.two_factor_enabled;

  let recoveryCodes = user.recovery_codes;
  if (newStatus && (!recoveryCodes || recoveryCodes.length === 0)) {
    recoveryCodes = Array.from({ length: 6 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );
  }

  const updated = db.updateUser(user.id, {
    two_factor_enabled: newStatus,
    recovery_codes: recoveryCodes,
  });

  res.json({
    success: true,
    two_factor_enabled: updated?.two_factor_enabled,
    recovery_codes: updated?.recovery_codes,
  });
});

// ==========================================
// 3. USER PROFILE ENDPOINTS
// ==========================================
apiRouter.put("/user/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { full_name, phone, language, profile_image } = req.body || {};

    const updates: Partial<DBUser> = {};
    if (full_name !== undefined) updates.full_name = String(full_name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (language !== undefined) updates.language = language;
    if (profile_image !== undefined) updates.profile_image = profile_image;

    const updatedUser = db.updateUser(user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ==========================================
// 4. AI IMAGE GENERATION
// ==========================================
apiRouter.post("/user/generate-image", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { prompt, negative_prompt, style, aspect_ratio } = req.body || {};

    if (!prompt || String(prompt).trim().length === 0) {
      return res.status(400).json({ error: "تکایە پەسنی وێنەکە (Prompt) بنووسە." });
    }

    // Check credits and subscription
    const activeSub = db.getActiveSubscription(user.id);
    const hasUnlimitedSub = activeSub && activeSub.subscription_status === "ACTIVE";

    if (!hasUnlimitedSub && user.free_ai_credits <= 0) {
      return res.status(403).json({
        error: "NO_CREDITS",
        message: "کرێدیتی بەردەستت نەماوە. تکایە بەشداریکردنی VIP ئەکتیڤ بکە بۆ دەستگەیشتنی بێسنوور.",
      });
    }

    const result = await generateAIImage({
      prompt: String(prompt).trim(),
      negative_prompt: negative_prompt ? String(negative_prompt).trim() : undefined,
      style: style || "cinematic",
      aspect_ratio: aspect_ratio || "1:1",
      user_id: user.id,
    });

    if (!result.success || !result.imageUrl) {
      return res.status(500).json({
        error: result.error || "کێشەیەک لە دروستکردنی وێنەکە ڕوویدا.",
      });
    }

    // Deduct credit if not unlimited
    let updatedCredits = user.free_ai_credits;
    if (!hasUnlimitedSub) {
      updatedCredits = Math.max(0, user.free_ai_credits - 1);
      db.updateUser(user.id, { free_ai_credits: updatedCredits });
    }

    const generation: DBGeneration = {
      id: crypto.randomBytes(8).toString("hex"),
      user_id: user.id,
      prompt: String(prompt).trim(),
      negative_prompt: negative_prompt ? String(negative_prompt).trim() : undefined,
      style: style || "cinematic",
      aspect_ratio: aspect_ratio || "1:1",
      image_url: result.imageUrl,
      generation_type: "AI_GENERATED",
      credit_used: hasUnlimitedSub ? 0 : 1,
      status: "SUCCESS",
      created_at: new Date().toISOString(),
    };

    db.addGeneration(generation);

    res.json({
      success: true,
      image_url: result.imageUrl,
      generation,
      remaining_credits: updatedCredits,
    });
  } catch (err: any) {
    console.error("Generate image endpoint error:", err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// ==========================================
// 5. GENERATIONS LIST & DELETE
// ==========================================
apiRouter.get("/user/generations", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const list = db.getUserGenerations(user.id);
  res.json(list);
});

apiRouter.delete("/user/generations/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const id = req.params.id;
  const deleted = db.deleteGeneration(id, user.id);
  if (!deleted) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.json({ success: true });
});

// ==========================================
// 6. SUBSCRIPTION MANAGEMENT & TELEGRAM
// ==========================================
const PLAN_CONFIG = {
  WEEKLY: { name: "WEEKLY", price: 15, durationDays: 7, label: "هەفتانە (Weekly)" },
  MONTHLY: { name: "MONTHLY", price: 45, durationDays: 30, label: "مانگانە (Monthly)" },
  YEARLY: { name: "YEARLY", price: 350, durationDays: 365, label: "ساڵانە (Yearly)" },
} as const;

apiRouter.get("/user/subscriptions", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const subs = db.getUserSubscriptions(user.id);
  const formatted = subs.map((s) => {
    let remainingDays = 0;
    if (s.expiry_date) {
      const diffMs = new Date(s.expiry_date).getTime() - Date.now();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
    return {
      ...s,
      remaining_days: remainingDays,
    };
  });
  res.json(formatted);
});

apiRouter.post("/user/subscriptions/request", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { plan } = req.body || {};

    const planKey = String(plan).toUpperCase() as keyof typeof PLAN_CONFIG;
    const planInfo = PLAN_CONFIG[planKey] || PLAN_CONFIG.MONTHLY;

    const requestId = `SUB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const now = new Date().toISOString();

    const sub: DBSubscription = {
      id: crypto.randomBytes(8).toString("hex"),
      user_id: user.id,
      plan_name: planInfo.name,
      price: planInfo.price,
      duration_days: planInfo.durationDays,
      start_date: null,
      expiry_date: null,
      payment_status: "PENDING",
      subscription_status: "PENDING",
      request_id: requestId,
      created_at: now,
      updated_at: now,
    };

    db.addSubscription(sub);

    // Notify Telegram Admin
    await notifyAdminSubscriptionRequest({
      userName: user.full_name,
      username: user.username,
      userId: user.id,
      email: user.email,
      selectedPlan: planInfo.label,
      price: planInfo.price,
      duration: `${planInfo.durationDays} ڕۆژ`,
      requestId,
      date: new Date().toLocaleString(),
      status: "PENDING",
    });

    // Notify user
    db.addNotification({
      id: crypto.randomBytes(8).toString("hex"),
      user_id: user.id,
      title: "داواکاری بەشداریکردن نێردرا",
      message: `داواکاری بەشداریکردنی ${planInfo.label} (کۆد: ${requestId}) بە سەرکەوتوویی گەیشتە تیمی بەڕێوەبردن. پاش پشتڕاستکردنەوە ئەکتیڤ دەکرێت.`,
      type: "info",
      read: false,
      created_at: now,
    });

    res.json({
      success: true,
      subscription: sub,
      message: "داواکارییەکەت نێردرا بۆ تیمی بەڕێوەبردن.",
    });
  } catch (err: any) {
    console.error("Subscription request error:", err);
    res.status(500).json({ error: "Failed to process subscription request" });
  }
});

// ==========================================
// 7. NOTIFICATIONS
// ==========================================
apiRouter.get("/user/notifications", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const notifs = db.getUserNotifications(user.id);
  res.json(notifs);
});

apiRouter.put("/user/notifications/:id/read", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const ok = db.markNotificationRead(req.params.id, user.id);
  res.json({ success: ok });
});

apiRouter.put("/user/notifications/read-all", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  db.markAllNotificationsRead(user.id);
  res.json({ success: true });
});

// ==========================================
// 8. CONTACT ADMIN & SUPPORT
// ==========================================
apiRouter.post("/user/contact-admin", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { request_type, message } = req.body || {};

    if (!message || String(message).trim().length === 0) {
      return res.status(400).json({ error: "تکایە پەیامەکەت بنووسە." });
    }

    const reqRecord: DBSupportRequest = {
      id: crypto.randomBytes(8).toString("hex"),
      user_id: user.id,
      username: user.username,
      full_name: user.full_name,
      request_type: request_type || "Support",
      message: String(message).trim(),
      created_at: new Date().toISOString(),
    };

    db.addSupportRequest(reqRecord);

    await notifyAdminContactMessage({
      userId: user.id,
      username: user.username,
      name: user.full_name,
      requestType: request_type || "General Inquiry",
      message: String(message).trim(),
      date: new Date().toLocaleString(),
    });

    res.json({
      success: true,
      message: "پەیامەکەت گەیشتە بەڕێوەبەر.",
    });
  } catch (err) {
    console.error("Contact admin error:", err);
    res.status(500).json({ error: "Failed to send message to admin" });
  }
});
