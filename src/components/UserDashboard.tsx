import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Generation, Notification } from "../types";
import {
  Sparkles,
  DollarSign,
  CreditCard,
  Image as ImageIcon,
  Wand2,
  Boxes,
  History,
  MessageSquare,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Bell,
  Download,
} from "lucide-react";

interface UserDashboardProps {
  onNavigate: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, direction } = useLanguage();

  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [recentNotifs, setRecentNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [genRes, notifRes] = await Promise.all([
          fetch("/api/user/generations"),
          fetch("/api/user/notifications"),
        ]);
        if (genRes.ok) {
          const genData = await genRes.json();
          setRecentGenerations(genData.generations?.slice(0, 4) || []);
        }
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setRecentNotifs(notifData.notifications?.slice(0, 3) || []);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (!user) return null;

  const activeSub = user.active_subscription;
  const hasActiveSub = activeSub && activeSub.subscription_status === "ACTIVE";
  const creditsPercentage = Math.round((user.free_ai_credits / 4) * 100);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Banner & Profile Summary */}
      <div
        id="dashboard-header"
        className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 sm:gap-5 z-10">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-extrabold text-2xl uppercase">
                {user.full_name.charAt(0) || "U"}
              </div>
            </div>
            <span
              id="status-badge-indicator"
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center"
              title={user.account_status}
            >
              <ShieldCheck className="w-3 h-3 text-white" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {user.account_status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              @{user.username} • {user.email}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto z-10">
          <button
            id="btn-dash-create-now"
            onClick={() => onNavigate("generator")}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>{t("create_new_image")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: FREE AI GENERATIONS */}
        <div
          id="card-free-credits"
          onClick={() => onNavigate("generator")}
          className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("free_ai_generations")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {hasActiveSub ? "∞" : `${user.free_ai_credits}`}
              </span>
              {!hasActiveSub && (
                <span className="text-sm font-bold text-slate-400">/ 4</span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {hasActiveSub
                ? "Unlimited with active plan"
                : user.free_ai_credits > 0
                ? `${user.free_ai_credits} free generations remaining`
                : t("free_credits_used_desc")}
            </p>
          </div>

          <div className="mt-4">
            {!hasActiveSub && (
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    user.free_ai_credits > 0 ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${creditsPercentage}%` }}
                />
              </div>
            )}
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>{hasActiveSub ? "Unlimited Access" : t("ai_generator")}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>

        {/* Card 2: BALANCE */}
        <div
          id="card-balance"
          className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("current_balance")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              ${user.balance.toFixed(2)}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Available account funds
            </p>
          </div>

          <div className="mt-4 pt-2">
            <button
              id="btn-add-balance"
              onClick={() => onNavigate("subscriptions")}
              className="w-full py-2 px-3 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t("add_balance")}</span>
            </button>
          </div>
        </div>

        {/* Card 3: ACTIVE SUBSCRIPTION */}
        <div
          id="card-subscription"
          onClick={() => onNavigate("subscriptions")}
          className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("active_subscription")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            {activeSub && activeSub.subscription_status === "ACTIVE" ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {activeSub.plan_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                    {activeSub.subscription_status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  ${activeSub.price} • {activeSub.remaining_days || 0} days remaining
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-slate-400">
                  {t("no_active_subscription")}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Upgrade for unlimited high-res generations
                </p>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
            <span>{t("subscriptions")}</span>
            <ChevronRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Card 4: TOTAL CREATIONS */}
        <div
          id="card-total-creations"
          onClick={() => onNavigate("history")}
          className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("total_generations")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {recentGenerations.length}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Generated in your studio
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            <span>{t("my_history")}</span>
            <ChevronRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {/* Free Credits Depleted Notice Banner (if 0 / 4 and no active plan) */}
      {!hasActiveSub && user.free_ai_credits === 0 && (
        <div
          id="banner-credits-depleted"
          className="p-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/30 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2"
        >
          <div>
            <h3 className="text-base font-extrabold text-rose-700 dark:text-rose-300">
              {t("free_credits_finished")}
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              {t("free_credits_used_desc")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-banner-choose-sub"
              onClick={() => onNavigate("subscriptions")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
            >
              {t("choose_subscription")}
            </button>
            <button
              id="btn-banner-contact-admin"
              onClick={() => onNavigate("contact")}
              className="px-4 py-2.5 rounded-2xl border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-500/10 transition-all"
            >
              {t("contact_admin")}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          {t("quick_actions")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            id="quick-action-generator"
            onClick={() => onNavigate("generator")}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Wand2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t("ai_generator")}
            </span>
          </button>

          <button
            id="quick-action-services"
            onClick={() => onNavigate("services")}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-teal-500/10 hover:border-teal-500/30 transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t("services")}
            </span>
          </button>

          <button
            id="quick-action-subscriptions"
            onClick={() => onNavigate("subscriptions")}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t("subscriptions")}
            </span>
          </button>

          <button
            id="quick-action-history"
            onClick={() => onNavigate("history")}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t("my_history")}
            </span>
          </button>

          <button
            id="quick-action-contact"
            onClick={() => onNavigate("contact")}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t("contact_admin")}
            </span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Generations & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Generated Images (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t("recent_generations")}
              </h3>
            </div>
            <button
              onClick={() => onNavigate("history")}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{t("view_all")}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {recentGenerations.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("no_generations_yet")}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                {t("empty_history_desc")}
              </p>
              <button
                onClick={() => onNavigate("generator")}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                {t("generate_now")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentGenerations.map((gen) => (
                <div
                  key={gen.id}
                  id={`recent-gen-${gen.id}`}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-square"
                >
                  <img
                    src={gen.image_url}
                    alt={gen.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                    <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                      {gen.prompt}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-emerald-400 font-bold">
                      <span>{gen.style}</span>
                      <a
                        href={gen.image_url}
                        download={`ai-image-${gen.id}.jpg`}
                        className="p-1 rounded bg-white/20 hover:bg-white/40 text-white"
                        title={t("download_image")}
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Glance (1 Col) */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t("notifications")}
                </h3>
              </div>
              <button
                onClick={() => onNavigate("notifications")}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{t("view_all")}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
              </button>
            </div>

            {recentNotifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {t("no_notifications")}
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border text-xs ${
                      !n.read
                        ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 font-medium"
                        : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                        {n.title}
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate("notifications")}
              className="w-full py-2 rounded-xl text-xs font-bold text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t("notifications")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
