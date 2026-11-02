import { useState } from "react";
import { Smile, Sparkles, Check, ShoppingBag, Plus, Star } from "lucide-react";

interface StickerPack {
  id: string;
  name: string;
  price: number;
  installed: boolean;
  stickers: string[];
}

export function StickersSection() {
  const [userPoints, setUserPoints] = useState(1250);
  const [selectedSticker, setSelectedSticker] = useState<string | null>("👑");

  const [packs, setPacks] = useState<StickerPack[]>([
    {
      id: "p1",
      name: "تایبەتی ICT & Gold",
      price: 0,
      installed: true,
      stickers: ["👑", "📈", "📉", "⚡", "🎯", "🔥", "💎", "🚀"]
    },
    {
      id: "p2",
      name: "ستیکەری جووڵاو (Animated FX)",
      price: 250,
      installed: false,
      stickers: ["🐂", "🐻", "💰", "⚡", "🌟", "🔥", "💎", "🏆"]
    }
  ]);

  const handleInstall = (packId: string, price: number) => {
    if (userPoints < price) {
      alert("خاڵەکانت بەس نییە بۆ کڕینی ئەم پاکەتە!");
      return;
    }
    setUserPoints(prev => prev - price);
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, installed: true } : p));
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6 sm:p-8 bg-[#080a0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl backdrop-blur-xl" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Smile className="w-6 h-6 text-[#d4af37]" /> ستیکەرە تایبەتەکان (Stickers & Badges)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">پاکەتی ستیکەر دابمەزرێنە، ستیکەر لە تەنیشت ناوت دابنە و لە چاتەکان بەکاری بهێنە</p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center gap-2 text-[#d4af37]">
          <Star className="w-4 h-4 fill-[#d4af37]" />
          <span className="text-xs font-bold">پوول / خاڵ: {userPoints} پۆینت</span>
        </div>
      </div>

      {/* Active Badge / Sticker next to username */}
      <div className="mb-8 p-6 bg-black/40 border border-[#d4af37]/30 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37]" /> ستیکەری دیاریکراو لە تەنیشت ناو (Active Badge)
        </h3>
        <p className="text-xs text-zinc-400 mb-4">ئەم ستیکەرە لە سەرجەم چات و گرووپەکان لە تەنیشت ناوی تەلەفۆنت دەردەکەوێت.</p>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            {selectedSticker || "👑"}
          </div>
          <span className="text-xs text-emerald-400 font-bold">✓ چالاککراوە</span>
        </div>
      </div>

      {/* Sticker Packs */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#d4af37]" /> مارکێتی ستیکەر و پاکەتەکان
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packs.map(pack => (
            <div key={pack.id} className="p-5 bg-black/60 border border-white/10 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-white">{pack.name}</h4>
                  <span className="text-xs font-mono text-[#d4af37]">{pack.price === 0 ? "خۆڕایی" : `${pack.price} پۆینت`}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {pack.stickers.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => pack.installed && setSelectedSticker(s)}
                      className={`h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-all ${
                        pack.installed ? "hover:scale-110 cursor-pointer hover:border-[#d4af37]" : "opacity-50 cursor-not-allowed"
                      } ${selectedSticker === s ? "border-[#d4af37] bg-[#d4af37]/20 shadow-[0_0_10px_rgba(212,175,55,0.3)]" : ""}`}
                      title={pack.installed ? "کلیک بکە بۆ هەڵبژاردن" : "سەرەتا پاکەتەکە دابمەزرێنە"}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {pack.installed ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> دابەزێنراوە (داگرە بۆ بەکارهێنان)
                  </div>
                ) : (
                  <button
                    onClick={() => handleInstall(pack.id, pack.price)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] text-black text-xs font-extrabold hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
                  >
                    کڕین و دامەزراندن ({pack.price} پۆینت)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
