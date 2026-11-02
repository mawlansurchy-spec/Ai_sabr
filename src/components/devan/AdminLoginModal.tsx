import React, { useState } from "react";
import { Shield, Lock, Eye, EyeOff, Loader2, X, AlertCircle } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("تکایە وشەی نهێنی بەڕێوەبەر بنووسە.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/devan/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        sessionStorage.setItem("devan_admin_token", data.token);
        onSuccess(data.token);
        onClose();
        setPassword("");
      } else {
        setError(data.error || "وشەی نهێنی بەڕێوەبەر هەڵەیە.");
      }
    } catch (err: any) {
      setError("کێشەیەک لە پەیوەندیکردن بە سێرڤەر هەیە.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-md p-6 bg-[#0c0f17] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden text-white">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">پانێڵی بەڕێوەبەری DEVAN</h2>
              <p className="text-[11px] text-[#d4af37]/90 font-mono">دەروازەی پارێزراوی ئیدارەی سیستەم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              وشەی نهێنی بەڕێوەبەر (Master Key):
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full px-11 py-3 text-sm text-white bg-black/60 border border-white/15 rounded-2xl focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 font-mono transition-all text-left"
                autoFocus
                dir="ltr"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>پشکنینی وشەی نهێنی...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>چوونەژوورەوەی بەڕێوەبەر</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-[10px] text-center text-gray-500 font-mono">
          هەموو هەوڵەکانی چوونەژوورەوە لە ژێر چاودێری سێرڤەردان.
        </p>
      </div>
    </div>
  );
}
