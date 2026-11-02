import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { LanguageCode } from "../types";
import {
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Globe,
  DollarSign,
  Sparkles,
  ShieldCheck,
  Save,
  Check,
  Loader2,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(user?.language || (language as LanguageCode));
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await updateProfile({
      full_name: fullName,
      phone,
      language: selectedLang,
    });

    setSaving(false);
    if (res.success) {
      setLanguage(selectedLang);
      showToast(t("save_changes"), t("profile_updated_success"), "success");
    } else {
      showToast(t("error"), res.error || "Failed to update profile", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-extrabold text-2xl uppercase">
              {user.full_name.charAt(0) || "U"}
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t("profile_settings_title")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("profile_settings_subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Role: USER (Protected)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editable Settings Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            id="form-edit-profile"
            onSubmit={handleSave}
            className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-5"
          >
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Personal Information (Editable)
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("full_name")}
              </label>
              <div className="relative">
                <input
                  id="input-profile-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("phone_number")}
              </label>
              <div className="relative">
                <input
                  id="input-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+964 750 000 0000"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("language_preference")}
              </label>
              <div className="relative">
                <select
                  id="select-profile-language"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as LanguageCode)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="ku_so">Kurdish Sorani — کوردی سۆرانی</option>
                  <option value="ku_ba">Kurdish Badini — کوردی بادینی</option>
                  <option value="ar">Arabic — العربية</option>
                  <option value="en">English</option>
                </select>
                <Globe className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t("save_changes")}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Protected Non-Editable Fields (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("protected_fields_title")}
              </h2>
              <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("protected_fields_desc")}
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Username</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  @{user.username}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {user.email}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Free AI Credits</span>
                <p className="text-xs font-black text-emerald-500 mt-0.5">
                  {user.free_ai_credits} / 4
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Account Balance</span>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                  ${user.balance.toFixed(2)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">System Role</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Standard User</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
