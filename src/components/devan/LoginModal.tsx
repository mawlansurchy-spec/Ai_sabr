import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Send
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { DevanUser } from "../../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: (user: DevanUser) => void;
  onPendingStatus: (user: DevanUser) => void;
  onExpiredStatus: (user: DevanUser) => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
  onPendingStatus,
  onExpiredStatus,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Set persistence according to rememberMe
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {
        console.warn("Persistence setup note:", pErr);
      }

      let devanUser: DevanUser | null = null;

      // 1. Try Firebase Auth sign-in first, fall back to backend resilient database
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );
        const fbUser = userCredential.user;

        // Query Firestore for user profile
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            devanUser = docSnap.data() as DevanUser;
          }
        } catch (fsErr) {
          console.warn("Firestore fetch error:", fsErr);
        }

        // Fallback to server user status check if needed
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
        console.warn("Firebase sign in notice, using resilient auth:", fbErr?.code || fbErr?.message);
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
          throw new Error(data.error || "Invalid email or password. Please verify your credentials.");
        }
      }

      if (!devanUser) {
        throw new Error("Unable to locate user account.");
      }

      try {
        localStorage.setItem("devan_user_session", JSON.stringify(devanUser));
      } catch (e) {}

      // Verify accountStatus rules
      if (devanUser.accountStatus === "SUSPENDED") {
        setErrorMessage("This account has been suspended by an administrator. Access is denied.");
        setIsLoading(false);
        return;
      }

      if (devanUser.accountStatus === "EXPIRED") {
        onExpiredStatus(devanUser);
        onClose();
        return;
      }

      // Also verify if expirationDate has passed
      if (devanUser.expirationDate) {
        const expTime = new Date(devanUser.expirationDate).getTime();
        if (expTime < Date.now()) {
          devanUser.accountStatus = "EXPIRED";
          onExpiredStatus(devanUser);
          onClose();
          return;
        }
      }

      if (devanUser.accountStatus === "PENDING") {
        onPendingStatus(devanUser);
        onClose();
        return;
      }

      // ACTIVE User
      onLoginSuccess(devanUser);
      onClose();
    } catch (err: any) {
      console.error("Login error:", err);
      let msg = "Invalid credentials or account does not exist.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Incorrect email or password. Please verify your details.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please wait a moment or reset your password.";
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address to receive password reset instructions.");
      return;
    }

    setIsResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setResetSuccessMessage("Password reset email sent! Please check your inbox and spam folder.");
    } catch (err: any) {
      console.error("Reset error:", err);
      setErrorMessage(err.message || "Failed to send reset email. Ensure the email address is registered.");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-[#0c0f17] border border-[#d4af37]/30 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.12)] overflow-hidden">
        {/* Top Champagne Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#f3e5ab]/5 border border-[#d4af37]/40 mb-3 text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Welcome to <span className="bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8010] bg-clip-text text-transparent">DEVAN</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Sign in to access your institutional trading intelligence suite.
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-3 mb-5 text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {resetSuccessMessage && (
          <div className="flex items-center gap-3 p-3 mb-5 text-xs text-emerald-200 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{resetSuccessMessage}</p>
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#d4af37] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37]"
                />
                Remember my session
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-semibold text-sm rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Forgot Password View */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isResetLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-semibold text-sm rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setErrorMessage(null);
                }}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Switcher to Register */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
          Don't have an account yet?{" "}
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-[#d4af37] hover:underline font-medium ml-1"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
