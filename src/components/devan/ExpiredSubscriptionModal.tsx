import React, { useState } from "react";
import { 
  AlertTriangle, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  RefreshCw, 
  LogOut, 
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { DevanUser } from "../../types";

interface ExpiredSubscriptionModalProps {
  user: DevanUser;
  onRenewed: (user: DevanUser) => void;
  onLogout: () => void;
}

export function ExpiredSubscriptionModal({
  user,
  onRenewed,
  onLogout,
}: ExpiredSubscriptionModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const planLabels = {
    WEEKLY: "Weekly (٧ ڕۆژ)",
    MONTHLY: "Monthly (٣٠ ڕۆژ)",
    YEARLY: "Yearly VIP (٣٦٥ ڕۆژ)",
  };

  const renewalMessage = `SUBSCRIPTION RENEWAL REQUEST\n\nFull Name: ${user.fullName}\nEmail: ${user.email}\nUser ID: ${user.uid}\nDesired Plan: ${planLabels[selectedPlan]}\nStatus: EXPIRED\n\nI would like to renew my DEVAN membership.`;

  const encodedMsg = encodeURIComponent(renewalMessage);
  const telegramDirectUrl = `https://t.me/qaesarr88?text=${encodedMsg}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renewalMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/devan/user/status/${user.uid}`);
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.user.accountStatus === "ACTIVE") {
          onRenewed(data.user);
          return;
        }
        setStatusMessage("داواکاری نوێکردنەوەکەت چاوەڕوانی پشتڕاستکردنەوەیە لەلایەن بەڕێوەبەرەوە.");
      } else {
        setStatusMessage("هێشتا نوێکردنەوەکە پەسەند نەکراوە.");
      }
    } catch (err: any) {
      setStatusMessage("نەتوانرا دۆخەکە بپشکنرێت لەم کاتەدا.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-[#0c0f17] border border-amber-500/30 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden text-white">
        {/* Amber Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">ماوەی بەشداریکردنت بەسەرچووە</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
            ماوەی بەشداریکردنی هەژمارەکەت تەواو بووە. تکایە پلانێک دیاریبکە و پەیوەندی بە بەڕێوەبەرەوە بکە لە تێلیگرام بۆ نوێکردنەوەی دەستبەجێ.
          </p>
        </div>

        {/* User Card */}
        <div className="p-4 bg-black/50 border border-white/5 rounded-2xl mb-5 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>بەکارهێنەر:</span>
            <span className="font-semibold text-white">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>ئیمەیڵ:</span>
            <span className="text-zinc-300 font-mono">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>دۆخ:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              EXPIRED (بەسەرچوو)
            </span>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            دیاریکردنی ماوەی نوێکردنەوە:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "WEEKLY", name: "١ هەفتە", days: "٧ ڕۆژ" },
              { id: "MONTHLY", name: "١ مانگ", days: "٣٠ ڕۆژ" },
              { id: "YEARLY", name: "١ ساڵ", days: "VIP ٣٦٥ ڕۆژ" },
            ].map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-zinc-400">{p.days}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div className="p-3 mb-4 text-xs text-amber-200 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center">
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={telegramDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-bold text-xs sm:text-sm rounded-xl shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>ناردنی داواکاری نوێکردنەوە بۆ @qaesarr88</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">پەیامەکە کۆپی کرا!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-400" />
                <span>کۆپیکردنی دەقی نوێکردنەوە</span>
              </>
            )}
          </button>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={isRefreshing}
              className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#d4af37]" : ""}`} />
              <span>پشکنینی دۆخ</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="py-2.5 px-4 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 text-xs text-red-300 hover:text-red-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>چوونەدەرەوە</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
