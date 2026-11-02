import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { Notification } from "../types";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";

export const NotificationsCenter: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/user/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}/read`, { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/user/notifications/read-all", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        showToast(t("mark_all_read"), "All notifications marked as read", "success");
      }
    } catch {
      // ignore
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            {t("notifications")}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t("notifications_title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("notifications_subtitle")} ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="btn-mark-all-read"
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>{t("mark_all_read")}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {t("all_notifications")} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "unread"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {t("unread_only")} ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold">
            Loading notifications...
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="py-16 text-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("no_notifications")}
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              info: <Info className="w-5 h-5 text-cyan-500" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
              error: <AlertCircle className="w-5 h-5 text-rose-500" />,
            };

            return (
              <div
                key={n.id}
                id={`notif-card-${n.id}`}
                className={`p-5 rounded-3xl border transition-all duration-200 flex items-start justify-between gap-4 backdrop-blur-xl ${
                  !n.read
                    ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20"
                    : "border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                    {icons[n.type] || icons.info}
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      {n.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title={t("mark_as_read")}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
