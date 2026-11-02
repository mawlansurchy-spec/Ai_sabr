import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { db, DBUser } from "./db";

// Rate limiting and login attempt tracker
interface LoginAttempt {
  count: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutes lockout

export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one special character." };
  }
  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function checkLoginRateLimit(ipOrId: string): { locked: boolean; remainingMinutes?: number } {
  const attempt = loginAttempts.get(ipOrId);
  if (!attempt) return { locked: false };

  if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
    const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / (60 * 1000));
    return { locked: true, remainingMinutes };
  }

  // Lockout expired, reset
  if (attempt.lockedUntil && attempt.lockedUntil <= Date.now()) {
    loginAttempts.delete(ipOrId);
    return { locked: false };
  }

  return { locked: false };
}

export function recordFailedLogin(ipOrId: string): { locked: boolean; remainingAttempts: number } {
  const attempt = loginAttempts.get(ipOrId) || { count: 0 };
  attempt.count += 1;

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_TIME_MS;
    loginAttempts.set(ipOrId, attempt);
    return { locked: true, remainingAttempts: 0 };
  }

  loginAttempts.set(ipOrId, attempt);
  return { locked: false, remainingAttempts: MAX_ATTEMPTS - attempt.count };
}

export function clearFailedLogin(ipOrId: string) {
  loginAttempts.delete(ipOrId);
}

export interface AuthenticatedRequest extends Request {
  user?: DBUser;
  sessionToken?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check cookie or Authorization header
  let token = req.cookies?.user_session;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please login." });
  }

  const session = db.getSession(token);
  if (!session) {
    res.clearCookie("user_session");
    return res.status(401).json({ error: "Session expired or invalid. Please login." });
  }

  const user = db.getUserById(session.user_id);
  if (!user) {
    db.deleteSession(token);
    res.clearCookie("user_session");
    return res.status(401).json({ error: "User not found." });
  }

  if (user.account_status === "DISABLED") {
    return res.status(403).json({
      error: "ACCOUNT_DISABLED",
      message: "Your account has been disabled. Please contact admin.",
    });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}
