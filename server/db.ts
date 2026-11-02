import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface DBUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password_hash: string;
  balance: number;
  free_ai_credits: number; // starts at 4
  account_status: "ACTIVE" | "SUSPENDED" | "DISABLED";
  language: "ku_so" | "ku_ba" | "ar" | "en";
  profile_image?: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  recovery_codes?: string[];
  created_at: string;
  updated_at: string;
}

export interface DBGeneration {
  id: string;
  user_id: string;
  prompt: string;
  negative_prompt?: string;
  style: string;
  aspect_ratio: string;
  image_url: string;
  generation_type: string;
  credit_used: number; // 1 or 0
  status: "SUCCESS" | "FAILED";
  created_at: string;
}

export interface DBSubscription {
  id: string;
  user_id: string;
  plan_name: "WEEKLY" | "MONTHLY" | "YEARLY";
  price: number;
  duration_days: number;
  start_date: string | null;
  expiry_date: string | null;
  payment_status: "PENDING" | "PAID" | "REJECTED";
  subscription_status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";
  request_id: string;
  created_at: string;
  updated_at: string;
}

export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface DBSession {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export interface DBSupportRequest {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  request_type: string;
  message: string;
  created_at: string;
}

interface DatabaseSchema {
  users: DBUser[];
  generations: DBGeneration[];
  subscriptions: DBSubscription[];
  notifications: DBNotification[];
  sessions: DBSession[];
  support_requests: DBSupportRequest[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  ensureDirectoryExists();
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: [],
      generations: [],
      subscriptions: [],
      notifications: [],
      sessions: [],
      support_requests: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, creating fresh:", err);
    return {
      users: [],
      generations: [],
      subscriptions: [],
      notifications: [],
      sessions: [],
      support_requests: [],
    };
  }
}

function saveDatabase(data: DatabaseSchema) {
  ensureDirectoryExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const db = {
  // Users
  getUserById(id: string): DBUser | undefined {
    const data = loadDatabase();
    return data.users.find((u) => u.id === id);
  },
  getUserByEmailOrUsername(identifier: string): DBUser | undefined {
    const data = loadDatabase();
    const clean = identifier.trim().toLowerCase();
    return data.users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
  },
  createUser(user: DBUser): DBUser {
    const data = loadDatabase();
    data.users.push(user);
    saveDatabase(data);
    return user;
  },
  updateUser(id: string, updates: Partial<DBUser>): DBUser | null {
    const data = loadDatabase();
    const index = data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    data.users[index] = {
      ...data.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(data);
    return data.users[index];
  },

  // Sessions
  createSession(userId: string, rememberMe = false): DBSession {
    const data = loadDatabase();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresDays = rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();
    const session: DBSession = {
      token,
      user_id: userId,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };
    data.sessions.push(session);
    saveDatabase(data);
    return session;
  },
  getSession(token: string): DBSession | undefined {
    const data = loadDatabase();
    const session = data.sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expires_at) < new Date()) {
      // expired
      this.deleteSession(token);
      return undefined;
    }
    return session;
  },
  deleteSession(token: string) {
    const data = loadDatabase();
    data.sessions = data.sessions.filter((s) => s.token !== token);
    saveDatabase(data);
  },
  deleteAllSessionsForUser(userId: string) {
    const data = loadDatabase();
    data.sessions = data.sessions.filter((s) => s.user_id !== userId);
    saveDatabase(data);
  },

  // Generations
  addGeneration(gen: DBGeneration): DBGeneration {
    const data = loadDatabase();
    data.generations.unshift(gen);
    saveDatabase(data);
    return gen;
  },
  getUserGenerations(userId: string): DBGeneration[] {
    const data = loadDatabase();
    return data.generations.filter((g) => g.user_id === userId);
  },
  deleteGeneration(id: string, userId: string): boolean {
    const data = loadDatabase();
    const initialLen = data.generations.length;
    data.generations = data.generations.filter((g) => !(g.id === id && g.user_id === userId));
    saveDatabase(data);
    return data.generations.length < initialLen;
  },

  // Subscriptions
  addSubscription(sub: DBSubscription): DBSubscription {
    const data = loadDatabase();
    data.subscriptions.unshift(sub);
    saveDatabase(data);
    return sub;
  },
  getUserSubscriptions(userId: string): DBSubscription[] {
    const data = loadDatabase();
    const now = new Date();
    // Auto expire any past expiry
    let changed = false;
    data.subscriptions.forEach((s) => {
      if (
        s.user_id === userId &&
        s.subscription_status === "ACTIVE" &&
        s.expiry_date &&
        new Date(s.expiry_date) < now
      ) {
        s.subscription_status = "EXPIRED";
        s.updated_at = now.toISOString();
        changed = true;
      }
    });
    if (changed) {
      saveDatabase(data);
    }
    return data.subscriptions.filter((s) => s.user_id === userId);
  },
  getActiveSubscription(userId: string): DBSubscription | null {
    const subs = this.getUserSubscriptions(userId);
    const active = subs.find((s) => s.subscription_status === "ACTIVE");
    return active || null;
  },

  // Notifications
  addNotification(notif: DBNotification): DBNotification {
    const data = loadDatabase();
    data.notifications.unshift(notif);
    saveDatabase(data);
    return notif;
  },
  getUserNotifications(userId: string): DBNotification[] {
    const data = loadDatabase();
    return data.notifications.filter((n) => n.user_id === userId);
  },
  markNotificationRead(id: string, userId: string): boolean {
    const data = loadDatabase();
    const notif = data.notifications.find((n) => n.id === id && n.user_id === userId);
    if (!notif) return false;
    notif.read = true;
    saveDatabase(data);
    return true;
  },
  markAllNotificationsRead(userId: string) {
    const data = loadDatabase();
    data.notifications.forEach((n) => {
      if (n.user_id === userId) {
        n.read = true;
      }
    });
    saveDatabase(data);
  },

  // Support Requests
  addSupportRequest(req: DBSupportRequest): DBSupportRequest {
    const data = loadDatabase();
    data.support_requests.unshift(req);
    saveDatabase(data);
    return req;
  },
};
