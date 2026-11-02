import { Router, Request, Response } from "express";
import { devanService } from "./devanService";

export const devanRouter = Router();

// Middleware to verify admin token
function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : (req.query.token as string) || (req.body.token as string);

  if (!devanService.validateAdminSession(token)) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired administrator session." });
  }
  next();
}

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
devanRouter.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }

  if (devanService.verifyAdminPassword(password)) {
    const token = devanService.createAdminSession();
    devanService.logAction("admin", "ADMIN_LOGGED_IN");
    return res.json({
      success: true,
      token,
      message: "Administrator authenticated successfully.",
    });
  }

  devanService.logAction("anonymous", "FAILED_ADMIN_LOGIN_ATTEMPT");
  return res.status(401).json({ error: "Invalid administrator credentials." });
});

devanRouter.get("/admin/verify", requireAdmin, (req, res) => {
  res.json({ success: true, valid: true });
});

devanRouter.post("/admin/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.body.token;
  if (token) {
    devanService.destroyAdminSession(token);
  }
  res.json({ success: true });
});

// ==========================================
// 2. ADMIN DASHBOARD DATA, STATS & SETTINGS
// ==========================================
devanRouter.get("/admin/stats", requireAdmin, (req, res) => {
  const stats = devanService.getStats();
  res.json({ success: true, stats });
});

devanRouter.get("/admin/users", requireAdmin, (req, res) => {
  const users = devanService.getUsers();
  res.json({ success: true, users });
});

devanRouter.get("/admin/requests", requireAdmin, (req, res) => {
  const requests = devanService.getActivationRequests();
  res.json({ success: true, requests });
});

devanRouter.get("/admin/logs", requireAdmin, (req, res) => {
  const logs = devanService.getLogs();
  res.json({ success: true, logs });
});

devanRouter.get("/admin/settings", requireAdmin, (req, res) => {
  const settings = devanService.getSettings();
  res.json({ success: true, settings });
});

devanRouter.post("/admin/settings", requireAdmin, (req, res) => {
  const settings = devanService.updateSettings(req.body);
  devanService.logAction("admin", "UPDATE_SETTINGS");
  res.json({ success: true, settings });
});

// ==========================================
// 3. ADMIN USER ACTIONS
// ==========================================
devanRouter.post("/admin/activate", requireAdmin, (req, res) => {
  const { userId, plan } = req.body;
  if (!userId || !["WEEKLY", "MONTHLY", "YEARLY"].includes(plan)) {
    return res.status(400).json({ error: "Invalid userId or subscription plan." });
  }

  try {
    const updated = devanService.activateUser(userId, plan, "admin");
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to activate user." });
  }
});

devanRouter.post("/admin/suspend", requireAdmin, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required." });

  try {
    const updated = devanService.suspendUser(userId, "admin");
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to suspend user." });
  }
});

devanRouter.post("/admin/restore", requireAdmin, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required." });

  try {
    const updated = devanService.restoreUser(userId, "admin");
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to restore user." });
  }
});

devanRouter.post("/admin/reject", requireAdmin, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required." });

  try {
    const updated = devanService.rejectUser(userId, "admin");
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reject user." });
  }
});

devanRouter.post("/admin/delete", requireAdmin, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required." });

  const deleted = devanService.deleteUser(userId, "admin");
  if (deleted) {
    res.json({ success: true, message: "User deleted successfully." });
  } else {
    res.status(404).json({ error: "User not found." });
  }
});

// ==========================================
// 4. CLIENT USER STATUS & TELEGRAM ACTIVATION
// ==========================================
devanRouter.post("/user/sync", (req, res) => {
  const { uid, fullName, email, phone } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: "uid and email are required." });
  }

  const existing = devanService.getUserByUid(uid);
  const now = new Date().toISOString();

  const user = devanService.upsertUser({
    uid,
    fullName: fullName || existing?.fullName || email.split("@")[0],
    email,
    phone: phone || existing?.phone || "",
    registrationDate: existing?.registrationDate || now,
    accountStatus: existing?.accountStatus || "PENDING",
    activationDate: existing?.activationDate || null,
    expirationDate: existing?.expirationDate || null,
    subscriptionType: existing?.subscriptionType || "NONE",
    emailVerified: false,
  });

  res.json({ success: true, user });
});

devanRouter.get("/user/status/:uid", (req, res) => {
  const { uid } = req.params;
  const user = devanService.getUserByUid(uid);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  res.json({ success: true, user });
});

devanRouter.post("/user/request-activation", (req, res) => {
  const { uid, fullName, email, phone } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: "uid and email are required." });
  }

  const user = devanService.getUserByUid(uid) || {
    uid,
    fullName: fullName || "User",
    email,
    phone: phone || "",
    registrationDate: new Date().toISOString(),
    accountStatus: "PENDING" as const,
    subscriptionType: "NONE" as const,
    emailVerified: false,
  };

  const activationRequest = devanService.createActivationRequest({
    userId: uid,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  });

  const tgMessage = devanService.buildTelegramMessage({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    uid: user.uid,
    registrationDate: user.registrationDate,
  });

  res.json({
    success: true,
    activationRequest,
    telegram: tgMessage,
  });
});

devanRouter.post("/user/mark-telegram-sent", (req, res) => {
  const { uid } = req.body;
  if (uid) {
    devanService.markTelegramSent(uid);
  }
  res.json({ success: true });
});

// ==========================================
// 5. RESILIENT DIRECT USER AUTHENTICATION
// ==========================================
devanRouter.post("/auth/register", (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const user = devanService.registerUserWithPassword({
      fullName,
      email,
      phone,
      password,
    });
    res.json({
      success: true,
      user,
      message: "User registered successfully.",
    });
  } catch (err: any) {
    console.error("Register endpoint error:", err);
    res.status(400).json({
      success: false,
      error: err.message || "Registration failed.",
    });
  }
});

devanRouter.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const user = devanService.loginUserWithPassword({ email, password });
    res.json({
      success: true,
      user,
      message: "Login successful.",
    });
  } catch (err: any) {
    console.error("Login endpoint error:", err);
    res.status(401).json({
      success: false,
      error: err.message || "Invalid email or password.",
    });
  }
});

devanRouter.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  devanService.logAction("anonymous", "FORGOT_PASSWORD_REQUESTED", email);
  res.json({
    success: true,
    message: "Password reset request recorded.",
  });
});
