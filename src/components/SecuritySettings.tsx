import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import {
  Shield,
  Lock,
  Smartphone,
  LogOut,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export const SecuritySettings: React.FC = () => {
  const { user, refreshUser, logoutAll } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState("");

  // 2FA state
  const [toggling2FA, setToggling2FA] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Logout all state
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const passChecks = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    };
  }, [newPassword]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (newPassword !== confirmPassword) {
      setPassError(t("passwords_must_match"));
      return;
    }

    const allPassed = Object.values(passChecks).every(Boolean);
    if (!allPassed) {
      setPassError(t("password_rules_desc"));
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      showToast(t("change_password"), t("password_updated_success"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError(err.message || "Failed to change password.");
      showToast(t("error"), err.message, "error");
    } finally {
      setChangingPass(false);
    }
  };

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    try {
      const res = await fetch("/api/auth/2fa/toggle", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        refreshUser();
        if (data.recovery_codes) {
          setRecoveryCodes(data.recovery_codes);
        }
        showToast(
          t("two_factor_auth"),
          data.two_factor_enabled ? t("two_factor_enabled") : t("two_factor_disabled"),
          "success"
        );
      }
    } catch (e: any) {
      showToast(t("error"), "Failed to toggle 2FA", "error");
    } finally {
      setToggling2FA(false);
    }
  };

  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    showToast("Copied!", "Recovery codes copied to clipboard", "info");
  };

  const handleLogoutAll = async () => {
    if (!confirm(t("confirm_logout_all"))) return;
    setLoggingOutAll(true);
    try {
      await logoutAll();
      showToast("Logged out", "All other device sessions terminated.", "info");
      window.location.reload();
    } catch {
      // ignore
    } finally {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            {t("security")}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t("security_title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("security_subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Change Password Card (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            id="form-change-password"
            onSubmit={handleChangePassword}
            className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("change_password")}
              </h2>
            </div>

            {passError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {passError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("current_password")} *
              </label>
              <div className="relative">
                <input
                  id="input-current-pass"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("new_password")} *
              </label>
              <div className="relative">
                <input
                  id="input-new-pass"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password checks indicators */}
              {newPassword.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] text-slate-500">
                  <span className={`flex items-center gap-1 ${passChecks.length ? "text-emerald-500 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.upper ? "text-emerald-500 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> 1 Uppercase
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.lower ? "text-emerald-500 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> 1 Lowercase
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.number && passChecks.special ? "text-emerald-500 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> Number & Special
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("confirm_new_password")} *
              </label>
              <input
                id="input-confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              id="btn-submit-change-pass"
              type="submit"
              disabled={changingPass}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {changingPass ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{t("change_password")}</span>
              )}
            </button>
          </form>
        </div>

        {/* 2FA and Session Security (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Two-Factor Authentication Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("two_factor_auth")}
                </h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  user?.two_factor_enabled
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {user?.two_factor_enabled ? t("two_factor_enabled") : t("two_factor_disabled")}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("two_factor_desc")}
            </p>

            <button
              id="btn-toggle-2fa"
              onClick={handleToggle2FA}
              disabled={toggling2FA}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                user?.two_factor_enabled
                  ? "border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20"
              }`}
            >
              {toggling2FA ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : user?.two_factor_enabled ? (
                t("disable_2fa")
              ) : (
                t("enable_2fa")
              )}
            </button>

            {/* Recovery codes display when enabled */}
            {recoveryCodes.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("backup_recovery_codes")}
                  </span>
                  <button
                    onClick={handleCopyRecoveryCodes}
                    className="p-1 text-slate-400 hover:text-emerald-500"
                  >
                    {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout from all devices */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-500" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("logout_all_devices")}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("logout_all_desc")}
            </p>
            <button
              id="btn-logout-all"
              onClick={handleLogoutAll}
              disabled={loggingOutAll}
              className="w-full py-3 rounded-2xl border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {loggingOutAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>{t("logout_all_devices")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
