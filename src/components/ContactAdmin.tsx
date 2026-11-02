import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import {
  MessageSquare,
  Send,
  User as UserIcon,
  CheckCircle2,
  HelpCircle,
  Clock,
  Loader2,
} from "lucide-react";

export const ContactAdmin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [requestType, setRequestType] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast(t("error"), "Please enter your message.", "warning");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/user/contact-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_type: requestType,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message to admin.");
      }

      setSentSuccess(true);
      setMessage("");
      showToast(t("contact_admin"), t("message_sent_admin_success"), "success");
    } catch (err: any) {
      showToast(t("error"), err.message || "Failed to send message.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            {t("support")}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t("contact_admin_title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("contact_admin_subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            id="form-contact-admin"
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4"
          >
            {sentSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{t("message_sent_admin_success")}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("request_type")}
              </label>
              <select
                id="select-request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Subscription & Payment">Subscription & Payment</option>
                <option value="Balance & Credits">Balance & Credits</option>
                <option value="Technical Support">Technical Support / Bug Report</option>
                <option value="Account Issue">Account Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("message_placeholder")} *
              </label>
              <textarea
                id="input-contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Type your message, issue details, or inquiry here..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none leading-relaxed"
              />
            </div>

            <button
              id="btn-send-contact-msg"
              type="submit"
              disabled={isSending}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t("send_message_to_admin")}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Telegram & Identity Verification Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verified Sender Metadata
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When you send a message, your verified user details are securely dispatched to the Admin via Telegram:
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">User ID</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{user.id}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Username</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">@{user.username}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Name</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{user.full_name}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Admin response time is typically within 1-2 hours during active business days.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
