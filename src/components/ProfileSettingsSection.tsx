import { useState } from "react";
import { User, Shield, Lock, Globe, Camera, Crown, Check, Save } from "lucide-react";
import { DevanUser } from "../types";

export function ProfileSettingsSection({ devanUser }: { devanUser?: DevanUser | null }) {
  const [fullName, setFullName] = useState(devanUser?.fullName || "مەولان سورچی");
  const [username, setUsername] = useState(devanUser?.email ? devanUser.email.split("@")[0] : "mawlan_ict");
  const [language, setLanguage] = useState("ckb");
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6 sm:p-8 bg-[#080a0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl backdrop-blur-xl" dir="rtl">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="relative">
          <img
            src="https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png"
            alt="Profile"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          />
          <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#d4af37] text-black hover:scale-105 transition-all cursor-pointer shadow-lg">
            <Camera className="w-3.5 h-3.5 fill-black" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>{fullName}</span>
            <Crown className="w-4 h-4 text-[#d4af37]" />
          </h2>
          <p className="text-xs text-[#d4af37] font-mono">@{username} • ئەندامی VIP Institutional</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" /> گۆڕانکارییەکان بە سەرکەوتوویی پاشەکەوت کران!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Info */}
        <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-[#d4af37]" /> زانیارییە کەسییەکان
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ناوی تەواو</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ناوی بەکارهێنەر (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Lock className="w-4 h-4 text-[#d4af37]" /> تایبەتمەندی و ئاسایش (Privacy)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">بینینی پرۆفایل</label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="public">گشتی (Public)</option>
                <option value="contacts">تەنیا بۆ هاوڕێکان</option>
                <option value="private">تایبەت</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">زمانی سیستەم (Language)</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="ckb">کوردی (سۆرانی)</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] text-black font-extrabold text-xs sm:text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 fill-black" /> پاشەکەوتکردنی گۆڕانکارییەکان
          </button>
        </div>
      </form>
    </div>
  );
}
