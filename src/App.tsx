/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { UploadZone } from "./components/UploadZone";
import { ResultReport } from "./components/ResultReport";
import { HistoryList } from "./components/HistoryList";
import { TvNews } from "./components/TvNews";
import { AiAssistantSection } from "./components/AiAssistantSection";

import { ProfileSettingsSection } from "./components/ProfileSettingsSection";
import { StickersSection } from "./components/StickersSection";
import { HistoryItem, FullHistoryItem, DevanUser } from "./types";
import { 
  Zap, 
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Lock,
  User as UserIcon,
  Crown,
  Activity,
  Shield,
  Menu,
  X,
  ChevronLeft,
  Bot,
  Headphones,
  MessageSquare,
  Users,
  Smile
} from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

// DEVAN Auth & Admin Components
import { KurdishAuthScreen } from "./components/devan/KurdishAuthScreen";
import { LandingPage } from "./components/devan/LandingPage";
import { RegisterModal } from "./components/devan/RegisterModal";
import { LoginModal } from "./components/devan/LoginModal";
import { AdminLoginModal } from "./components/devan/AdminLoginModal";
import { AdminDashboard } from "./components/devan/AdminDashboard";
import { ActivationPendingModal } from "./components/devan/ActivationPendingModal";
import { ExpiredSubscriptionModal } from "./components/devan/ExpiredSubscriptionModal";

// Profile & Logo URL
const newLogoImg = "https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png";
const profileLink = "https://ibb.co/JRfHmTpT";

export default function App() {
  // Authentication & Session States
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [devanUser, setDevanUser] = useState<DevanUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Modal Open/Close States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Platform Tabs
  const [activeTab, setActiveTab] = useState<"analyze" | "news_setup" | "tv" | "history" | "ai_assistant" | "profile_settings" | "stickers">("analyze");
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentResult, setCurrentResult] = useState<FullHistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [appError, setAppError] = useState<string | null>(null);

  // 1. Check for active Admin Session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("devan_admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
      fetch("/api/devan/admin/verify", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsAdminLoggedIn(true);
          } else {
            sessionStorage.removeItem("devan_admin_token");
            setAdminToken(null);
          }
        })
        .catch(() => {
          sessionStorage.removeItem("devan_admin_token");
          setAdminToken(null);
        });
    }
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNavMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Listen to Firebase Auth state
  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Real-time listener on user doc
        const userDocRef = doc(db, "users", fbUser.uid);
        unsubscribeUserDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const uData = docSnap.data() as DevanUser;
              setDevanUser(uData);
            } else {
              // If not yet written to Firestore, check server status
              fetch(`/api/devan/user/status/${fbUser.uid}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data.success && data.user) {
                    setDevanUser(data.user);
                  } else {
                    setDevanUser({
                      uid: fbUser.uid,
                      fullName: fbUser.displayName || fbUser.email?.split("@")[0] || "Trader",
                      email: fbUser.email || "",
                      phone: "",
                      registrationDate: new Date().toISOString(),
                      accountStatus: "PENDING",
                      subscriptionType: "WEEKLY",
                      emailVerified: fbUser.emailVerified,
                    });
                  }
                })
                .catch(() => {
                  setDevanUser({
                    uid: fbUser.uid,
                    fullName: fbUser.displayName || "Trader",
                    email: fbUser.email || "",
                    phone: "",
                    registrationDate: new Date().toISOString(),
                    accountStatus: "PENDING",
                    subscriptionType: "WEEKLY",
                    emailVerified: fbUser.emailVerified,
                  });
                });
            }
            setIsAuthLoading(false);
          },
          (err) => {
            console.warn("Firestore user snapshot note:", err);
            // Fallback to server check
            fetch(`/api/devan/user/status/${fbUser.uid}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.success && data.user) {
                  setDevanUser(data.user);
                }
              })
              .finally(() => setIsAuthLoading(false));
          }
        );
      } else {
        // Fallback to locally persisted session when Firebase Auth is unavailable or bypassed
        const savedSession = localStorage.getItem("devan_user_session");
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession) as DevanUser;
            if (parsed && parsed.uid) {
              fetch(`/api/devan/user/status/${parsed.uid}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data.success && data.user) {
                    setDevanUser(data.user);
                  } else {
                    setDevanUser(parsed);
                  }
                })
                .catch(() => {
                  setDevanUser(parsed);
                })
                .finally(() => setIsAuthLoading(false));
              return;
            }
          } catch (e) {}
        }
        setDevanUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const safeFetchJson = async (
    url: string,
    optionsOrFactory?: RequestInit | (() => RequestInit),
    maxRetries = 1
  ): Promise<any> => {
    let lastError: any = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      try {
        const baseOpts = typeof optionsOrFactory === "function" ? optionsOrFactory() : optionsOrFactory;
        const opts = {
          ...baseOpts,
          signal: baseOpts?.signal || controller.signal,
        };
        const res = await fetch(url, opts);
        clearTimeout(timeoutId);
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (!res.ok) return data;
          return data;
        }

        const rawText = await res.text();
        console.warn(`Attempt ${attempt + 1}: Received non-JSON content from ${url} (length: ${rawText.length}).`);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        return { status: "error", message: `Server error (${res.status}). Please try again.` };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        if (attempt < maxRetries) {
          console.warn(`Fetch error on attempt ${attempt + 1}, retrying in 1s...`, err);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        if (err?.name === "AbortError" || String(err?.message || "").toLowerCase().includes("abort")) {
          throw new Error("Request Timeout. The server required more time, please try again.");
        }
        throw err;
      }
    }
    throw lastError || new Error("Failed to communicate with server.");
  };

  const fetchHistory = async () => {
    try {
      const data = await safeFetchJson("/api/history");
      if (Array.isArray(data)) {
        setHistoryItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    if (devanUser?.accountStatus === "ACTIVE" && activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, devanUser?.accountStatus]);

  const handleUserLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
    try {
      localStorage.removeItem("devan_user_session");
      localStorage.removeItem("dr_devan_auth_token");
    } catch (e) {}
    setFirebaseUser(null);
    setDevanUser(null);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("devan_admin_token");
    setIsAdminLoggedIn(false);
  };

  const handleUpload = async (
    file: File,
    newsEvent?: string,
    pair?: string,
    timeframe?: string,
    mode: "pure_chart" | "news_setup" = "pure_chart",
    aiModel?: string
  ) => {
    setIsUploading(true);
    setCurrentResult(null);
    setAppError(null);

    const fileToBase64 = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
    };

    try {
      let data: any = null;

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("mode", mode);
        if (newsEvent) formData.append("news_event", newsEvent);
        if (pair) formData.append("currency_pair", pair);
        if (timeframe) formData.append("timeframe", timeframe);
        if (aiModel) formData.append("ai_model", aiModel);

        data = await safeFetchJson(
          "/api/generate-signal",
          {
            method: "POST",
            body: formData,
          },
          0
        );
      } catch (uploadErr) {
        console.warn("FormData upload encountered an issue, trying base64 JSON payload...", uploadErr);
        const base64Data = await fileToBase64(file);
        data = await safeFetchJson(
          "/api/generate-signal",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64Data,
              mode,
              news_event: newsEvent,
              currency_pair: pair,
              timeframe,
              ai_model: aiModel,
            }),
          },
          1
        );
      }

      if (data && data.status === "success" && data.item) {
        setCurrentResult(data.item);
        setAppError(null);
      } else {
        setAppError(data?.message || "An error occurred during chart analysis. Please try again.");
      }
    } catch (err: any) {
      console.warn("Upload handler caught error:", err?.message || err);
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network") || msg.toLowerCase().includes("failed")) {
        setAppError("Connection interrupted. Please verify your connection and try again.");
      } else {
        setAppError(msg || "Server communication issue. Please retry.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const loadHistoryItem = async (id: string) => {
    try {
      const data = await safeFetchJson(`/api/history/${id}`);
      if (data) {
        setCurrentResult(data);
        setActiveTab("analyze");
      }
    } catch (err) {
      console.error("Failed to load history item", err);
    }
  };

  // Helper to calculate remaining subscription days
  const getRemainingDays = (expirationDate?: string | null): number => {
    if (!expirationDate) return 0;
    const diff = new Date(expirationDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // -------------------------------------------------------------
  // VIEW ROUTING
  // -------------------------------------------------------------

  // 1. If Administrator is logged in: Show Admin Dashboard
  if (isAdminLoggedIn) {
    return (
      <AdminDashboard
        token={adminToken || sessionStorage.getItem("devan_admin_token") || ""}
        onLogout={handleAdminLogout}
        onReturnToPlatform={() => setIsAdminLoggedIn(false)}
      />
    );
  }

  // 2. Loading State: Display luxury DEVAN pulse
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07090e] text-white">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#d4af37]/40 p-1 bg-black shadow-[0_0_30px_rgba(212,175,55,0.25)] animate-pulse mb-4">
          <img src={newLogoImg} alt="DEVAN" className="w-full h-full object-cover rounded-xl" />
        </div>
        <div className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-[#d4af37] bg-clip-text text-transparent">
          DEVAN
        </div>
        <div className="text-xs text-zinc-500 font-mono mt-1">Initializing Secure Session...</div>
      </div>
    );
  }

  // 3. Not Logged In: Show Kurdish Auth Screen (Matching original design with full background, profile logo & Kurdish tabs)
  if (!devanUser) {
    return (
      <>
        <KurdishAuthScreen
          onLoginSuccess={(user) => setDevanUser(user)}
          onPendingStatus={(user) => setDevanUser(user)}
          onExpiredStatus={(user) => setDevanUser(user)}
          onOpenAdminModal={() => setShowAdminLoginModal(true)}
        />

        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={(token) => {
            setAdminToken(token);
            setIsAdminLoggedIn(true);
            setShowAdminLoginModal(false);
          }}
        />
      </>
    );
  }

  // 4. User is PENDING: Show Activation Pending Modal with Telegram Link (@qaesarr88)
  if (devanUser.accountStatus === "PENDING") {
    return (
      <ActivationPendingModal
        user={devanUser}
        onActivated={(updated) => setDevanUser(updated)}
        onLogout={handleUserLogout}
      />
    );
  }

  // 5. User is EXPIRED: Show Expired Subscription Modal with Telegram Renewal Link
  if (devanUser.accountStatus === "EXPIRED" || (devanUser.expirationDate && new Date(devanUser.expirationDate).getTime() < Date.now())) {
    return (
      <ExpiredSubscriptionModal
        user={devanUser}
        onRenewed={(updated) => setDevanUser(updated)}
        onLogout={handleUserLogout}
      />
    );
  }

  // 6. User is SUSPENDED: Deny Access
  if (devanUser.accountStatus === "SUSPENDED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#07090e] text-white" dir="rtl">
        <div className="w-full max-w-md p-8 bg-[#0c0f17] border border-red-500/30 rounded-3xl text-center shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-400 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">هەژمارەکەت هەڵپەسێردراوە</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            دەسەڵاتی چوونەژوورەوەی ئەم هەژمارە ڕاگیراوە لەلایەن بەڕێوەبەرەوە. تکایە بۆ چارەسەرکردن پەیوەندی بە بەڕێوەبەرەوە بکە لە تێلیگرام (@qaesarr88).
          </p>
          <button
            onClick={handleUserLogout}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>چوونەدەرەوە</span>
          </button>
        </div>
      </div>
    );
  }

  // 7. User is ACTIVE: Render Full Platform
  const remainingDays = getRemainingDays(devanUser.expirationDate);

  return (
    <div 
      className="min-h-screen font-sans text-gray-200 selection:bg-[#d4af37]/30 selection:text-white flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat bg-[#07090e]" 
      dir="rtl"
      style={{ backgroundImage: 'url("https://i.ibb.co/NdxLnfBZ/Picsart-26-06-30-01-45-32-294.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Ambient Luxury Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="h-16 md:h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#07090e]/90 z-30 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
          {/* Right Side in RTL: Menu Button & Brand Info */}
          <div className="flex items-center gap-3">
            {/* Menu Trigger Button on the Right */}
            <button
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/15 to-[#d4af37]/10 hover:from-[#d4af37]/30 hover:to-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all font-bold text-xs sm:text-sm cursor-pointer active:scale-95 group"
              title="مێنۆی بەشەکان"
            >
              <Menu className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <span className="font-extrabold tracking-wide">مێنۆ</span>
            </button>

            {/* Brand Info */}
            <a
              href={profileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)] bg-black hover:border-[#d4af37] transition-all group"
            >
              <img src={newLogoImg} alt="DEVAN" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </a>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-white via-zinc-200 to-[#d4af37] bg-clip-text text-transparent">
                  DEVAN
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                  PRO
                </span>
              </h1>
              <p className="text-[9px] text-[#d4af37] font-bold tracking-widest uppercase">
                Institutional ICT Terminal
              </p>
            </div>
          </div>

          {/* Center: Current active section indicator badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/25 text-xs text-zinc-300 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
            <span className="text-zinc-400 font-medium">بەشی چالاک:</span>
            <span className="text-white font-bold">
              {activeTab === "analyze" && "شیکاری و سیگناڵی چارت"}
              {activeTab === "news_setup" && "شیکاری هەواڵ و چارت"}
              {activeTab === "tv" && "TradingView Live"}
              {activeTab === "history" && "ئەرشیفی سیگناڵەکان"}
              {activeTab === "ai_assistant" && "یاریدەدەری AI"}

              {activeTab === "profile_settings" && "پرۆفایل و ڕێکخستنەکان"}
              {activeTab === "stickers" && "ستیکەرەکان"}
            </span>
          </div>

          {/* Left Side: User Membership & Logout */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <Crown className="w-3 h-3 text-[#d4af37]" />
                {devanUser.fullName}
              </span>
              <span className="text-[10px] text-[#d4af37] font-mono">
                {devanUser.subscriptionType} • {remainingDays} ڕۆژ ماوە
              </span>
            </div>

            <button
              onClick={handleUserLogout}
              className="p-2 md:px-3 md:py-1.5 rounded-xl bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 text-xs text-zinc-300 hover:text-red-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">چوونەدەرەوە</span>
            </button>
          </div>
        </div>
      </header>

      {/* Right Side Navigation Drawer Menu (هەموو بەشەکان بە یەک ڕێز لەدەستە ڕاست) */}
      {isNavMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNavMenuOpen(false)}
          />

          {/* Drawer content on right */}
          <aside className="relative w-full max-w-sm sm:w-96 h-full bg-[#080a0f] border-l border-white/10 shadow-[-15px_0_40px_rgba(0,0,0,0.85)] z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Top / Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#d4af37]/40 shadow-[0_0_12px_rgba(212,175,55,0.2)] bg-black">
                    <img src={newLogoImg} alt="DEVAN" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">
                      <span className="bg-gradient-to-r from-white via-zinc-200 to-[#d4af37] bg-clip-text text-transparent">
                        مێنۆی سەرەکی
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                        DEVAN
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">بەشەکانی سیستەم بە یەک ڕێز</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNavMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  title="داخستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items List - Single Vertical Line (هەمویی بە یەک ڕێز) */}
              <div className="p-4 space-y-2.5">
                <div className="text-[11px] font-bold text-zinc-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                  <span>هەڵبژاردنی بەش</span>
                  <span className="text-[10px] text-[#d4af37] font-mono">ICT PRO</span>
                </div>

                {/* 1. Chart Analysis & Signals */}
                <button
                  onClick={() => {
                    setActiveTab("analyze");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "analyze"
                      ? "bg-gradient-to-l from-[#d4af37]/20 via-[#d4af37]/10 to-transparent border-[#d4af37]/60 text-white shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "analyze"
                        ? "bg-[#d4af37]/25 border-[#d4af37]/50 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-[#d4af37] group-hover:border-[#d4af37]/30"
                    }`}>
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        شیکاری و سیگناڵی چارت
                        {activeTab === "analyze" && (
                          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">دۆزینەوەی OB، FVG و سیگناڵی کڕین و فرۆشتن</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "analyze" ? "text-[#d4af37] translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>

                {/* 2. News & Chart Analysis */}
                <button
                  onClick={() => {
                    setActiveTab("news_setup");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "news_setup"
                      ? "bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/60 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "news_setup"
                        ? "bg-amber-500/25 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30"
                    }`}>
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        شیکاری هەواڵ و چارت
                        {activeTab === "news_setup" && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">هەواڵی ئابووری High Impact و کاریگەری نرخ</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "news_setup" ? "text-amber-400 translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>

                {/* 3. TradingView Live */}
                <button
                  onClick={() => {
                    setActiveTab("tv");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "tv"
                      ? "bg-gradient-to-l from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/60 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "tv"
                        ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30"
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        TradingView Live
                        {activeTab === "tv" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">چارتی ڕاستەوخۆ بە کاتی ڕاستەقینە</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "tv" ? "text-emerald-400 translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>

                {/* 4. History Archive */}
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "history"
                      ? "bg-gradient-to-l from-purple-500/20 via-purple-500/10 to-transparent border-purple-500/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "history"
                        ? "bg-purple-500/25 border-purple-500/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-purple-400 group-hover:border-purple-500/30"
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        ئەرشیفی سیگناڵەکان
                        {activeTab === "history" && (
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">تۆماری هەموو شیکاری و پێشبینییە پێشووەکان</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "history" ? "text-purple-400 translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>

                {/* 5. AI Assistant */}
                <button
                  onClick={() => {
                    setActiveTab("ai_assistant");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "ai_assistant"
                      ? "bg-gradient-to-l from-cyan-500/20 via-cyan-500/10 to-transparent border-cyan-500/60 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "ai_assistant"
                        ? "bg-cyan-500/25 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30"
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        یاریدەدەری زیرەک (AI Assistant)
                        {activeTab === "ai_assistant" && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">شیکاری زانستی و چاتی زیرەکی ICT</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "ai_assistant" ? "text-cyan-400 translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>

                {/* AI Voice removed */}

                {/* Messages and Group Chat removed */}

                {/* 9. Profile & Settings */}
                <button
                  onClick={() => {
                    setActiveTab("profile_settings");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "profile_settings"
                      ? "bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/60 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "profile_settings"
                        ? "bg-amber-500/25 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30"
                    }`}>
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        پرۆفایل و ڕێکخستنەکان (Profile)
                        {activeTab === "profile_settings" && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">گۆڕینی ناو، وێنە و ڕێکخستنی هەژمار</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "profile_settings" ? "text-amber-400 translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>

                {/* 10. My Stickers */}
                <button
                  onClick={() => {
                    setActiveTab("stickers");
                    setCurrentResult(null);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-right cursor-pointer group ${
                    activeTab === "stickers"
                      ? "bg-gradient-to-l from-[#d4af37]/20 via-[#d4af37]/10 to-transparent border-[#d4af37]/60 text-white shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      activeTab === "stickers"
                        ? "bg-[#d4af37]/25 border-[#d4af37]/50 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-[#d4af37] group-hover:border-[#d4af37]/30"
                    }`}>
                      <Smile className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        ستیکەرەکانی من (My Stickers)
                        {activeTab === "stickers" && (
                          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">کۆمەڵەی ستیکەر، کڕین بە پۆینت و بەجید</div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-all ${
                    activeTab === "stickers" ? "text-[#d4af37] translate-x-[-2px]" : "text-zinc-600 group-hover:text-zinc-300"
                  }`} />
                </button>
              </div>
            </div>

            {/* Drawer Bottom: User info & logout */}
            <div className="p-4 border-t border-white/10 bg-black/70 space-y-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{devanUser.fullName}</div>
                    <div className="text-[10px] text-[#d4af37] font-mono">{devanUser.subscriptionType} • {remainingDays} ڕۆژ ماوە</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    handleUserLogout();
                  }}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white transition-all cursor-pointer"
                  title="چوونەدەرەوە"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Trading Platform Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 z-10 flex flex-col justify-start">
        {appError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-center justify-between backdrop-blur-md">
            <span>{appError}</span>
            <button onClick={() => setAppError(null)} className="text-red-400 hover:text-white font-bold px-2">✕</button>
          </div>
        )}

        {activeTab === "analyze" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <span className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3 inline-block shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                🎯 سیستەمی پێشکەوتووی DEVAN ICT & SMC
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                شیکاری چارت و بەرهەمهێنانی سیگناڵ
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                وێنەی چارتەکەت دابنێ بۆ دۆزینەوەی ئۆردەربلۆک، FVG، نەختینەی بازاڕ (BSL/SSL) و ستۆپ لۆزی دەقیق و نەپچڕاو.
              </p>
            </div>

            {!currentResult && (
              <UploadZone
                onUpload={(file, news, pair, tf, aiModel) => handleUpload(file, news, pair, tf, "pure_chart", aiModel)}
                onDirectResult={(item) => {
                  setCurrentResult(item);
                  setAppError(null);
                }}
                isUploading={isUploading}
                mode="pure_chart"
              />
            )}

            {currentResult && (
              <div className="mt-8">
                <div className="flex justify-center mb-8">
                  <button
                    onClick={() => setCurrentResult(null)}
                    className="text-sm font-bold text-[#07090e] bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] px-8 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-black" /> دەستپێکردنی شیکردنەوەیەکی نوێ
                  </button>
                </div>
                <ResultReport item={currentResult} />
              </div>
            )}
          </div>
        ) : activeTab === "news_setup" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3 inline-block shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                ⚡ داشبۆردی شیکاری هەواڵ و چارت (News-Driven Analysis)
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                شیکاری هەواڵ و چارت (News & Chart Analysis)
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                تێکەڵکردنی شیکاری پرایس ئەکشن لەگەڵ کاریگەری هەواڵە ئابوورییە بەهێزەکان (CPI, NFP, FOMC) و دیاریپێکردنی جووتە دراو بۆ سیگناڵ.
              </p>
            </div>
            
            {!currentResult && (
              <UploadZone
                onUpload={(file, news, pair, tf, aiModel) => handleUpload(file, news, pair, tf, "news_setup", aiModel)}
                onDirectResult={(item) => {
                  setCurrentResult(item);
                  setAppError(null);
                }}
                isUploading={isUploading}
                mode="news_setup"
              />
            )}

            {currentResult && (
              <div className="mt-8">
                <div className="flex justify-center mb-8">
                  <button
                    onClick={() => setCurrentResult(null)}
                    className="text-sm font-bold text-black bg-amber-400 px-8 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-black" /> دەستپێکردنی شیکردنەوەیەکی نوێ
                  </button>
                </div>
                <ResultReport item={currentResult} />
              </div>
            )}
          </div>
        ) : activeTab === "history" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">ئەرشیفی سیگناڵەکان</h2>
              <p className="text-gray-400 text-lg">
                گەڕانەوە بۆ شیکردنەوەکانی پێشوو
              </p>
            </div>
            <HistoryList items={historyItems} onSelect={loadHistoryItem} />
          </div>
        ) : activeTab === "tv" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TvNews />
          </div>
        ) : activeTab === "ai_assistant" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AiAssistantSection />
          </div>

        ) : activeTab === "profile_settings" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProfileSettingsSection devanUser={devanUser} />
          </div>
        ) : activeTab === "stickers" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StickersSection />
          </div>
        ) : null}
      </main>

      {/* Footer with Discreet Hidden Admin Shield Icon */}
      <footer className="w-full py-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>سیستەمی</span>
            <span className="text-[#d4af37] font-bold tracking-wider">DEVAN Institutional</span>
            <span>• هەموو مافەکان پارێزراون</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://t.me/qaesarr88" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-zinc-400 hover:text-[#d4af37] transition-colors"
            >
              پەیوەندی بە بەڕێوەبەر (@qaesarr88)
            </a>

            {/* Hidden admin access icon */}
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="text-zinc-700 hover:text-[#d4af37] transition-colors p-1.5 rounded-lg opacity-40 hover:opacity-100 cursor-pointer"
              title="System Lock"
              aria-label="Admin Verification"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={(token) => {
          setAdminToken(token);
          setIsAdminLoggedIn(true);
          setShowAdminLoginModal(false);
        }}
      />
    </div>
  );
}
