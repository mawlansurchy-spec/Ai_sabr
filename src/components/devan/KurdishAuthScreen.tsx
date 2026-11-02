import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Shield
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { DevanUser } from "../../types";

interface KurdishAuthScreenProps {
  onLoginSuccess: (user: DevanUser) => void;
  onPendingStatus: (user: DevanUser) => void;
  onExpiredStatus: (user: DevanUser) => void;
  onOpenAdminModal: () => void;
}

export function KurdishAuthScreen({
  onLoginSuccess,
  onPendingStatus,
  onExpiredStatus,
  onOpenAdminModal,
}: KurdishAuthScreenProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginBgImg = "https://i.ibb.co/BVsBn5N5/file-00000000d680820aa3ba9041ed0cfb94.png";
  const newLogoImg = "https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png";
  const profileLink = "https://ibb.co/JRfHmTpT";

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Master password fallback check
    if (password.trim() === "Dr.devvA11@55" || password.trim() === "DEVAN@88") {
      const masterUser: DevanUser = {
        uid: "master_operator",
        fullName: "Dr.Devan",
        email: email.trim() || "devan@trading.ai",
        phone: "+9647500000000",
        registrationDate: new Date().toISOString(),
        accountStatus: "ACTIVE",
        subscriptionType: "YEARLY",
        emailVerified: true,
      };
      if (rememberMe) {
        try {
          localStorage.setItem("dr_devan_auth_token", "authenticated_v2");
        } catch (e) {}
      }
      onLoginSuccess(masterUser);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("تکایە ئیمەیڵ و وشەی نهێنی بنووسە.");
      return;
    }

    setIsLoading(true);

    try {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {}

      let devanUser: DevanUser | null = null;

      // 1. Try Firebase Auth first, but seamlessly fall back to backend on any failure or operation-not-allowed
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );
        const fbUser = userCredential.user;

        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            devanUser = docSnap.data() as DevanUser;
          }
        } catch (fsErr) {
          console.warn("Firestore fetch error:", fsErr);
        }

        if (!devanUser) {
          try {
            const res = await fetch(`/api/devan/user/status/${fbUser.uid}`);
            const data = await res.json();
            if (res.ok && data.user) {
              devanUser = data.user;
            }
          } catch (serverErr) {}
        }

        if (!devanUser) {
          devanUser = {
            uid: fbUser.uid,
            fullName: fbUser.displayName || email.split("@")[0],
            email: fbUser.email || email,
            phone: "",
            registrationDate: new Date().toISOString(),
            accountStatus: "PENDING",
            subscriptionType: "WEEKLY",
            emailVerified: fbUser.emailVerified,
          };
        }
      } catch (fbErr: any) {
        console.warn("Firebase Auth bypassed/unavailable:", fbErr?.code || fbErr?.message);
        // Fall back seamlessly to backend resilient database auth
        const res = await fetch("/api/devan/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          devanUser = data.user;
        } else {
          throw new Error(data.error || "ئیمەیڵ یان وشەی نهێنی نادروستە. تکایە زانیارییەکانت بپشکنەوە.");
        }
      }

      if (!devanUser) {
        throw new Error("نەتوانرا پڕۆفایلی بەکارهێنەر دیاری بکرێت.");
      }

      // Persist session if rememberMe checked
      if (rememberMe) {
        try {
          localStorage.setItem("devan_user_session", JSON.stringify(devanUser));
        } catch (e) {}
      }

      if (devanUser.accountStatus === "SUSPENDED") {
        setErrorMessage("ئەم هەژمارە هەڵپەسێردراوە لەلایەن بەڕێوەبەرەوە.");
        setIsLoading(false);
        return;
      }

      if (devanUser.accountStatus === "EXPIRED" || (devanUser.expirationDate && new Date(devanUser.expirationDate).getTime() < Date.now())) {
        onExpiredStatus(devanUser);
        return;
      }

      if (devanUser.accountStatus === "PENDING") {
        onPendingStatus(devanUser);
        return;
      }

      onLoginSuccess(devanUser);
    } catch (err: any) {
      console.warn("Login attempt result:", err);
      let msg = err?.message || "ئیمەیڵ یان وشەی نهێنی نادروستە. تکایە زانیارییەکانت بپشکنەوە.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "وشەی نهێنی یان ئیمەیڵ هەڵەیە. تکایە دووبارە تاقی بکەرەوە.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "هەوڵی زۆر دراوە. کەمێکی تر دووبارە هەوڵ بدەرەوە.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("تکایە ناوی تەواوت بنووسە (بە لایەنی کەم ٢ پیت).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("تکایە ئیمەیڵێکی دروست بنووسە.");
      return;
    }
    const phoneClean = phone.replace(/[^0-9+]/g, "");
    if (!phoneClean || phoneClean.length < 8) {
      setErrorMessage("تکایە ژمارەی مۆبایل بە دروستی بنووسە.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("وشەی نهێنی و دووبارەکردنەوەی یەکناگرنەوە.");
      return;
    }

    setIsLoading(true);

    try {
      let registeredUser: DevanUser | null = null;

      // 1. First attempt resilient backend registration
      const regRes = await fetch("/api/devan/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });
      const regData = await regRes.json();

      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error || "هەڵەیەک ڕوویدا لە تۆمارکردندا. تکایە دووبارە هەوڵ بدەرەوە.");
      }

      registeredUser = regData.user;

      // 2. Silently attempt client Firebase Auth integration (non-blocking if disabled on GCP)
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );
        const fbUser = userCredential.user;
        if (fbUser) {
          await updateProfile(fbUser, { displayName: fullName.trim() }).catch(() => {});
          await sendEmailVerification(fbUser).catch(() => {});
        }
      } catch (fbErr) {
        console.warn("Client Firebase Auth optional sync note:", fbErr);
      }

      // 3. Sync to Firestore if accessible
      if (registeredUser) {
        try {
          const userDocRef = doc(db, "users", registeredUser.uid);
          await setDoc(userDocRef, registeredUser);

          await addDoc(collection(db, "activation_requests"), {
            userId: registeredUser.uid,
            fullName: registeredUser.fullName,
            email: registeredUser.email,
            phone: registeredUser.phone,
            requestDate: registeredUser.registrationDate,
            requestStatus: "PENDING",
            telegramRequestStatus: "PENDING",
          });
        } catch (fsErr) {
          console.warn("Firestore sync fallback note:", fsErr);
        }
      }

      // Persist user session locally
      if (rememberMe && registeredUser) {
        try {
          localStorage.setItem("devan_user_session", JSON.stringify(registeredUser));
        } catch (e) {}
      }

      setSuccessMessage("هەژمارەکەت بە سەرکەوتوویی تۆمارکرا! ئاڕاستەی پەیجی کاراکردن دەکرێیت...");
      setTimeout(() => {
        if (registeredUser) {
          onPendingStatus(registeredUser);
        }
      }, 1000);
    } catch (err: any) {
      console.error("Register error:", err);
      let msg = err?.message || "هەڵەیەک ڕوویدا لە تۆمارکردندا. تکایە دووبارە هەوڵ بدەرەوە.";
      if (err.code === "auth/email-already-in-use") {
        msg = "ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە.";
      } else if (err.code === "auth/invalid-email") {
        msg = "ئیمەیڵەکە دروست نییە.";
      } else if (err.code === "auth/weak-password") {
        msg = "وشەی نهێنی زۆر لاوازە.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("تکایە ئیمەیڵەکەت بنووسە بۆ ناردنی لینکی گۆڕینی وشەی نهێنی.");
      return;
    }

    setIsLoading(true);
    try {
      let sentViaFirebase = false;
      try {
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
        sentViaFirebase = true;
      } catch (fbErr: any) {
        console.warn("Firebase password reset note:", fbErr);
      }

      await fetch("/api/devan/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      }).catch(() => {});

      setSuccessMessage(
        sentViaFirebase
          ? "لینکی گۆڕینی وشەی نهێنی بۆ ئیمەیڵەکەت نێردرا. سەیری ئیمەیڵ و بەشی Spam بکە."
          : "داواکاری نوێکردنەوەی وشەی نهێنی تۆمارکرا! پەیوەندی بە بەڕێوەبەرەوە بکە لە تێلیگرام (@qaesarr88)."
      );
    } catch (err: any) {
      setErrorMessage("نەتوانرا لینکی گۆڕین بنێردرێت. دڵنیابە ئیمەیڵەکەت دروستە.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black select-none" dir="rtl">
      {/* Full uncropped high-resolution background artwork */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none" 
        style={{ backgroundImage: `url("${loginBgImg}")` }}
      />
      
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      {/* Main Glass Card */}
      <div className="w-full max-w-[340px] sm:max-w-[400px] bg-black/60 border border-white/20 rounded-3xl p-5 sm:p-7 backdrop-blur-xl relative z-10 shadow-[0_8px_40px_rgba(0,0,0,0.8)] transition-all mx-4 text-white">
        
        {/* Profile Avatar & Top Header */}
        <div className="flex flex-col items-center mb-5">
          <a 
            href={profileLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mb-3 transition-transform hover:scale-105 active:scale-95 group"
          >
            <img 
              src={newLogoImg} 
              alt="Dr.Devan Profile" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.4)] object-cover group-hover:border-[#d4af37] transition-all" 
            />
          </a>

          {/* Kurdish Disclaimer Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 w-full text-center mb-4">
            <p className="text-amber-300 text-[11px] leading-relaxed font-medium">
              ئەمە Ai تکایە ئاگەداربە مەسولیاتی هیچ شتێک هەڵناگرم ئەمە بازاڕە
            </p>
          </div>

          {/* Tab Switcher: Login / Register */}
          <div className="flex w-full rounded-2xl bg-white/5 border border-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setShowForgotPassword(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === "login"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              چوونەژوورەوە
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setShowForgotPassword(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === "register"
                  ? "bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              خۆتۆمارکردن
            </button>
          </div>
        </div>

        {/* Feedback Notices */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-xl leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-emerald-200 bg-emerald-950/60 border border-emerald-500/40 rounded-xl leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === "login" && !showForgotPassword && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ئیمەیڵ"
                  className="w-full bg-white/5 border border-white/20 focus:border-emerald-400 rounded-2xl px-10 py-2.5 text-white placeholder:text-gray-400 outline-none text-xs sm:text-sm transition-all"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="وشەی نهێنی"
                  className="w-full bg-white/5 border border-white/20 focus:border-emerald-400 rounded-2xl px-10 py-2.5 text-white placeholder:text-gray-400 outline-none text-xs sm:text-sm transition-all"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-emerald-500 accent-emerald-500"
                />
                <span>لەبیرم مەچۆ</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-[#d4af37] hover:underline"
              >
                وشەی نهێنیت لەبیرچووە؟
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99] text-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>چاوەڕوانبە...</span>
                </>
              ) : (
                <span>چوونەژوورەوە</span>
              )}
            </button>
          </form>
        )}

        {/* 2. FORGOT PASSWORD VIEW */}
        {authMode === "login" && showForgotPassword && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs text-zinc-300 mb-1.5">
                ئیمەیڵی تۆمارکراو بنووسە:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/20 focus:border-emerald-400 rounded-2xl px-10 py-2.5 text-white placeholder:text-gray-400 outline-none text-xs sm:text-sm transition-all"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>ناردنی لینکی گۆڕین</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="text-xs text-zinc-400 hover:text-white mt-1 text-center"
            >
              گەڕانەوە بۆ چوونەژوورەوە
            </button>
          </form>
        )}

        {/* 3. REGISTER FORM */}
        {authMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5">
            {/* Full Name */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ناوی سیانی"
                  className="w-full bg-white/5 border border-white/20 focus:border-[#d4af37] rounded-2xl px-10 py-2 text-white placeholder:text-gray-400 outline-none text-xs transition-all"
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ئیمەیڵ"
                  className="w-full bg-white/5 border border-white/20 focus:border-[#d4af37] rounded-2xl px-10 py-2 text-white placeholder:text-gray-400 outline-none text-xs transition-all"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ژمارەی مۆبایل"
                  className="w-full bg-white/5 border border-white/20 focus:border-[#d4af37] rounded-2xl px-10 py-2 text-white placeholder:text-gray-400 outline-none text-xs transition-all"
                />
                <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="وشەی نهێنی (لانیکەم ٦ پیت)"
                  className="w-full bg-white/5 border border-white/20 focus:border-[#d4af37] rounded-2xl px-10 py-2 text-white placeholder:text-gray-400 outline-none text-xs transition-all"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="دووبارەکردنەوەی وشەی نهێنی"
                  className="w-full bg-white/5 border border-white/20 focus:border-[#d4af37] rounded-2xl px-10 py-2 text-white placeholder:text-gray-400 outline-none text-xs transition-all"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] text-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>تۆمارکردن...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>خۆتۆمارکردن و داواکاری کاراکردن</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Discreet Hidden Admin Access Point in Footer Corner */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={onOpenAdminModal}
          className="text-zinc-600 hover:text-[#d4af37] p-2 rounded-xl transition-all opacity-40 hover:opacity-100 cursor-pointer"
          title="دەروازەی بەڕێوەبەر"
          aria-label="Admin Verification"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
