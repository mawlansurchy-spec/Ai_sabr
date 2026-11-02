import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  X, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../../firebase";
import { DevanUser } from "../../types";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegistered: (user: DevanUser) => void;
}

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegistered,
}: RegisterModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = (): string | null => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      return "Please enter your full name (at least 2 characters).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please provide a valid email address.";
    }
    const phoneClean = phone.replace(/[^0-9+]/g, "");
    if (!phoneClean || phoneClean.length < 8) {
      return "Please enter a valid mobile number with country code.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match. Please verify your password.";
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const validationErr = validate();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Resilient backend registration
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
        throw new Error(regData.error || "Registration failed. Please check your information.");
      }

      const devanUserData: DevanUser = regData.user;

      // 2. Optional client Firebase Auth account attempt
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

      // 3. Save user document to Firestore if accessible
      try {
        const userDocRef = doc(db, "users", devanUserData.uid);
        await setDoc(userDocRef, devanUserData);

        await addDoc(collection(db, "activation_requests"), {
          userId: devanUserData.uid,
          fullName: devanUserData.fullName,
          email: devanUserData.email,
          phone: devanUserData.phone,
          requestDate: devanUserData.registrationDate,
          requestStatus: "PENDING",
          telegramRequestStatus: "PENDING",
        });
      } catch (firestoreErr) {
        console.warn("Firestore write notice:", firestoreErr);
      }

      try {
        localStorage.setItem("devan_user_session", JSON.stringify(devanUserData));
      } catch (e) {}

      setSuccessNotice("Registration successful! Initializing your activation channel...");

      setTimeout(() => {
        onRegistered(devanUserData);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Registration error:", err);
      let msg = err?.message || "Registration failed. Please check your information.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/invalid-email") {
        msg = "The provided email address is invalid.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-[#0c0f17] border border-[#d4af37]/30 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.12)] overflow-hidden">
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
            Create <span className="bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8010] bg-clip-text text-transparent">DEVAN</span> Account
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Experience elite institutional market analytics and real-time precision signals.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-3 mb-5 text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successNotice && (
          <div className="flex items-center gap-3 p-3 mb-5 text-xs text-emerald-200 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{successNotice}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name <span className="text-[#d4af37]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Johnathan Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address <span className="text-[#d4af37]">*</span>
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

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Mobile Number <span className="text-[#d4af37]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password <span className="text-[#d4af37]">*</span>
              </label>
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

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Confirm Password <span className="text-[#d4af37]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-semibold text-sm rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register & Request Activation</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-[#d4af37] hover:underline font-medium ml-1"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
