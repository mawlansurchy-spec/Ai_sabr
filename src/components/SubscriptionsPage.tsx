import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { Subscription } from "../types";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Send,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const SubscriptionsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t, direction } = useLanguage();
  const { showToast } = useToast();

  const [subscriptionsHistory, setSubscriptionsHistory] = useState<Subscription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Modal flow state
  const [selectedPlan, setSelectedPlan] = useState<{
    id: "WEEKLY" | "MONTHLY" | "YEARLY";
    name: string;
    price: number;
    days: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function fetchSubs() {
      try {
        const res = await fetch("/api/user/subscriptions");
        if (res.ok) {
          const data = await res.json();
          setSubscriptionsHistory(data.subscriptions || []);
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchSubs();
  }, []);

  const plans = [
    {
      id: "WEEKLY" as const,
      name: t("plan_weekly"),
      price: 100,
      days: 7,
      durationLabel: t("plan_weekly_duration"),
      tag: "Flexible",
      highlight: false,
    },
    {
      id: "MONTHLY" as const,
      name: t("plan_monthly"),
      price: 200,
      days: 30,
      durationLabel: t("plan_monthly_duration"),
      tag: t("popular"),
      highlight: true,
    },
    {
      id: "YEARLY" as const,
      name: t("plan_yearly"),
      price: 500,
      days: 365,
      durationLabel: t("plan_yearly_duration"),
      tag: "Best Value",
      highlight: false,
    },
  ];

  const planFeatures = [
    t("feature_unlimited_gen"),
    t("feature_all_services"),
    t("feature_priority_proc"),
    t("feature_hd_downloads"),
    t("feature_support"),
  ];

  const activeSub = user?.active_subscription;
  const isCurrentlyActive = activeSub && activeSub.subscription_status === "ACTIVE";

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/subscriptions/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_name: selectedPlan.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit subscription request.");
      }

      setSuccessRequestId(data.request_id);
      showToast(t("subscription_success_modal_title"), data.message, "success");
      refreshUser();

      // Refresh list
      const subsRes = await fetch("/api/user/subscriptions");
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscriptionsHistory(subsData.subscriptions || []);
      }
    } catch (err: any) {
      showToast(t("error"), err.message || "Failed to request subscription.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRequestId = () => {
    if (successRequestId) {
      navigator.clipboard.writeText(successRequestId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      showToast("Copied!", "Request ID copied to clipboard", "info");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            {t("subscriptions")}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t("subscription_plans_title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t("subscription_plans_subtitle")}
          </p>
        </div>

        {/* Current status pill */}
        <div className="px-4 py-2.5 rounded-2xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
            {t("active_subscription")}
          </span>
          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
            {isCurrentlyActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-500">{activeSub.plan_name}</span>
                <span className="text-slate-400 font-normal">({activeSub.remaining_days} days left)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-slate-500">{t("no_active_subscription")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentThisPlan = isCurrentlyActive && activeSub.plan_name === plan.id;

          return (
            <div
              key={plan.id}
              id={`plan-card-${plan.id.toLowerCase()}`}
              className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative backdrop-blur-xl ${
                plan.highlight
                  ? "border-emerald-500/80 bg-gradient-to-b from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 shadow-2xl ring-2 ring-emerald-500/30 scale-[1.02]"
                  : "border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    plan.highlight
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {plan.tag}
                </span>

                {isCurrentThisPlan && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    / {plan.durationLabel}
                  </span>
                </div>

                <div className="space-y-2.5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {planFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase button */}
              <button
                id={`btn-select-plan-${plan.id.toLowerCase()}`}
                onClick={() => {
                  setSelectedPlan(plan);
                  setSuccessRequestId(null);
                }}
                className={`w-full mt-8 py-3.5 rounded-2xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{t("select_plan")}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Subscription Requests & History Table */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Subscription Requests & History</span>
        </h3>

        {subscriptionsHistory.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No previous subscription requests found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3 text-start">{t("request_id")}</th>
                  <th className="py-3 px-3 text-start">{t("plan")}</th>
                  <th className="py-3 px-3 text-start">{t("price")}</th>
                  <th className="py-3 px-3 text-start">{t("duration")}</th>
                  <th className="py-3 px-3 text-start">{t("status")}</th>
                  <th className="py-3 px-3 text-start">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {subscriptionsHistory.map((sub) => {
                  const statusColors = {
                    PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    EXPIRED: "bg-slate-200 dark:bg-slate-800 text-slate-500",
                    REJECTED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  };

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {sub.request_id}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {sub.plan_name}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-500">
                        ${sub.price}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {sub.duration_days} Days
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[sub.subscription_status]}`}>
                          {sub.subscription_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation / Success Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {!successRequestId ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t("confirm_subscription_title")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("confirm_subscription_desc")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("plan")}:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {selectedPlan.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("price")}:</span>
                    <span className="font-extrabold text-emerald-500">
                      ${selectedPlan.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("duration")}:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedPlan.days} Days
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">{t("status")}:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-500">
                      {t("pending_admin_approval")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    id="btn-confirm-sub-request"
                    onClick={handleConfirmPurchase}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t("confirm_purchase")}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* SUCCESS STATE */
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {t("subscription_success_modal_title")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  {t("subscription_request_sent_desc")}
                </p>

                {/* Request ID Display */}
                <div className="my-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
                  <div className="text-start">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      {t("request_id")}
                    </span>
                    <p className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {successRequestId}
                    </p>
                  </div>
                  <button
                    id="btn-copy-req-id"
                    onClick={handleCopyRequestId}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  id="btn-close-sub-success"
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow-md transition-all"
                >
                  {t("continue")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
