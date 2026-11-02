import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  User, 
  Mail, 
  Hash, 
  LogOut,
  Phone
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { DevanUser } from "../../types";

interface ActivationPendingModalProps {
  user: DevanUser;
  onActivated: (updatedUser: DevanUser) => void;
  onLogout: () => void;
}

export function ActivationPendingModal({
  user,
  onActivated,
  onLogout,
}: ActivationPendingModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Build the official Telegram activation message
  const dateFormatted = user.registrationDate
    ? new Date(user.registrationDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US");

  const activationMessage = `NEW ACTIVATION REQUEST\n\nFull Name: ${user.fullName}\nEmail: ${user.email}\nPhone: ${user.phone}\nUser ID: ${user.uid}\nRegistration Date: ${dateFormatted}\nAccount Status: PENDING\n\nI request activation of my account.`;

  const encodedMsg = encodeURIComponent(activationMessage);
  // Official direct telegram conversation link with username @qaesarr88
  const telegramDirectUrl = `https://t.me/qaesarr88?text=${encodedMsg}`;

  // Attach real-time Firestore listener on user document
  useEffect(() => {
    if (!user.uid) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as DevanUser;
          if (data.accountStatus === "ACTIVE") {
            onActivated(data);
          }
        }
      },
      (error) => {
        console.warn("Firestore snapshot listener notice:", error);
      }
    );

    return () => unsubscribe();
  }, [user.uid, onActivated]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(activationMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/devan/user/status/${user.uid}`);
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.user.accountStatus === "ACTIVE") {
          onActivated(data.user);
          return;
        }
        setStatusMessage("هەژمارەکەت هێشتا چاوەڕوانی چالاککردنە لەلایەن بەڕێوەبەرەوە (@qaesarr88).");
      } else {
        setStatusMessage("هەژمارەکەت چاوەڕوانکراوە. تکایە پەیامەکە لە تێلیگرام بنێرە بۆ بەڕێوەبەر.");
      }
    } catch (err: any) {
      setStatusMessage("دۆخەکە نوێکرایەوە. چاوەڕوانی پەسەندکردنی بەڕێوەبەربە.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTelegramClick = () => {
    fetch("/api/devan/user/request-activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      }),
    }).catch(() => {});

    window.open(telegramDirectUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#07090e] relative overflow-hidden select-none" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#0c1017]/95 border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_12px_50px_rgba(0,0,0,0.8)] relative z-10 text-white">
        
        {/* Top Status Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-wider">
              چاوەڕوانکراو
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            هەژمارەکەت چاوەڕوانی کاراکردنە
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
            هەژمارەکەت بە سەرکەوتوویی تۆمارکرا. تکایە لەڕێگەی دوگمەی خوارەوە داواکاری بنێرە بۆ بەڕێوەبەر لە تێلیگرام بۆ ئەوەی دەستبەجێ هەژمارەکەت چالاک بکات.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 mb-6 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#d4af37]" /> ناوی سیانی:
            </span>
            <span className="text-white font-bold">{user.fullName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> ئیمەیڵ:
            </span>
            <span className="text-white font-mono">{user.email}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> مۆبایل:
            </span>
            <span className="text-white font-mono">{user.phone || "تۆمارکراو"}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-purple-400" /> ناسنامە (User ID):
            </span>
            <span className="text-gray-300 text-[11px] font-mono truncate max-w-[200px]" title={user.uid}>
              {user.uid}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">دۆخی هەژمار:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[11px]">
              PENDING (چاوەڕوانی پەسەندکردن)
            </span>
          </div>
        </div>

        {/* Action: Send Activation Request to Telegram */}
        <div className="space-y-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-black/60 border border-blue-500/30 text-xs">
            <p className="text-blue-300 font-bold mb-1 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> کاراکردنی ڕاستەوخۆ لەڕێگەی تێلیگرام
            </p>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              کلیک لەم دوگمەیە بکە بۆ ناردنی پەیامی کاراکردنی هەژمارەکەت ڕاستەوخۆ بۆ بەڕێوەبەر (<strong>@qaesarr88</strong>).
            </p>
          </div>

          <button
            type="button"
            onClick={handleTelegramClick}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#229ED9] via-[#0088cc] to-[#0077b5] hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(0,136,204,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>SEND ACTIVATION REQUEST TO TELEGRAM</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">دەقەکە کۆپی کرا!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>کۆپیکردنی دەقی داواکاری</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="پشکنینی دۆخی هەژمار"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#d4af37]" : ""}`} />
              <span>پشکنینی دۆخ</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Real-time sync note & Logout */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            سیستەمی کارابوونی خۆکارانە چالاکە
          </span>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> چوونەدەرەوە
          </button>
        </div>

      </div>
    </div>
  );
}
