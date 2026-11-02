import { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  Check, 
  Cpu, 
  Zap, 
  BrainCircuit, 
  Flame, 
  SlidersHorizontal, 
  CheckCircle2, 
  Edit3,
  X
} from "lucide-react";
import { AiModelOption } from "../types";

export const AI_MODELS: AiModelOption[] = [
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 / 3.5 Sonnet",
    provider: "Anthropic",
    tagline: "Deep Market Structure & SMC Liquidity",
    description: "شیکاری قووڵی پێکهاتەی بازاڕ (Market Structure)، ڕاماڵینی نەختینە (Liquidity Sweeps)، و ئۆردەر بلۆکی بانکەکان.",
    badge: "تایبەت بە SMC / ICT",
    color: "from-amber-500/20 to-orange-500/10 text-amber-300",
    accentBorder: "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    icon: "brain"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    tagline: "High-Precision Chart OCR & Price Action",
    description: "خوێندنەوەی ئێجگار وردی ژمارەکانی سەر ئاوێنەی نرخ، فیبۆناچی و دیاریکردنی خاڵی چوونەنەژوورەوەی تەواو.",
    badge: "خوێندنەوەی وردی OCR",
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
    accentBorder: "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    icon: "zap"
  },
  {
    id: "gemini-pro",
    name: "Gemini 2.5 Pro / Flash",
    provider: "Google DeepMind",
    tagline: "Institutional Multimodal Visual Matrix",
    description: "تێگەیشتنی خێرای هەموو جۆرە وێنەیەکی MT5 و TradingView لەگەڵ دۆزینەوەی پاتێرنە سەرەکییەکان.",
    badge: "بینینی مۆڵتیمۆداڵ",
    color: "from-blue-500/20 to-cyan-500/10 text-blue-300",
    accentBorder: "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    icon: "sparkles"
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek Quant",
    tagline: "Step-by-Step Reasoning & Order Book Imbalance",
    description: "شیکاری لۆژیکی بە شێوازی بیرکردنەوەی هەنگاو بە هەنگاو (Chain-of-Thought) و هاوسەنگی مامەڵەکان.",
    badge: "بیرکردنەوەی کوانت (Quant)",
    color: "from-indigo-500/20 to-purple-500/10 text-indigo-300",
    accentBorder: "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]",
    icon: "cpu"
  },
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xAI",
    tagline: "High-Speed Momentum & Institutional Flow",
    description: "شیکاری نەوسانی بەهێز (High Volatility) و بەدواداچوونی جووڵەی پارەی گەورە لە بازاڕدا.",
    badge: "نەوسان و خێرایی",
    color: "from-rose-500/20 to-pink-500/10 text-rose-300",
    accentBorder: "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)]",
    icon: "flame"
  },
  {
    id: "other",
    name: "Other (دڵخوازی خۆت بنووسە...)",
    provider: "Custom AI Preference",
    tagline: "User-defined AI Model or Custom Trading Prompt",
    description: "دەتوانیت هەر مۆدێلێکی تری وەک Llama 3.3, Claude Opus, یان شێوازی تایبەتی خۆت بنووسیت.",
    badge: "مۆدێلی دڵخواز",
    color: "from-purple-500/20 to-violet-500/10 text-purple-300",
    accentBorder: "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]",
    icon: "custom",
    isCustom: true
  }
];

interface AiModelSelectorProps {
  selectedModel: string;
  customModelName: string;
  onSelectModel: (modelId: string, customName?: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export function AiModelSelector({
  selectedModel,
  customModelName,
  onSelectModel,
  isOpen = true,
  onClose,
  isModal = false
}: AiModelSelectorProps) {
  const [localCustomName, setLocalCustomName] = useState(customModelName || "");
  const [showToast, setShowToast] = useState(false);
  const [confirmedModelName, setConfirmedModelName] = useState("");

  const handleSelect = (model: AiModelOption) => {
    if (model.id === "other") {
      const finalCustom = localCustomName.trim() || "Custom AI Engine";
      onSelectModel("other", finalCustom);
      setConfirmedModelName(finalCustom);
    } else {
      onSelectModel(model.id);
      setConfirmedModelName(model.name);
    }
    
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      if (isModal && onClose) {
        onClose();
      }
    }, 1500);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "brain":
        return <BrainCircuit className="w-5 h-5 text-amber-400" />;
      case "zap":
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case "sparkles":
        return <Sparkles className="w-5 h-5 text-blue-400" />;
      case "cpu":
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case "flame":
        return <Flame className="w-5 h-5 text-rose-400" />;
      default:
        return <Bot className="w-5 h-5 text-purple-400" />;
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="w-full space-y-5" dir="rtl">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <SlidersHorizontal className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              هەڵبژاردنی بزوێنەری ژیریی دەستکرد (AI Model Engine)
              <span className="text-xs px-2.5 py-0.5 bg-white/10 text-emerald-400 rounded-full border border-emerald-500/30">
                چالاک
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              مۆدێلی دڵخوازی خۆت دیاری بکە بۆ شیکردنەوەی وێنەی چارتەکانی TradingView و MT5.
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Confirmation Toast */}
      {showToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm font-bold">مۆدێلی ژیریی دەستکرد جێگیرکرا!</div>
            <div className="text-xs text-emerald-200">
              چارتەکانت ئێستا بە پشتبەستن بە شێوازی <span className="font-bold underline">{confirmedModelName}</span> شیکاری دەکرێن.
            </div>
          </div>
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {AI_MODELS.map((model) => {
          const isSelected = selectedModel === model.id;

          return (
            <div
              key={model.id}
              onClick={() => handleSelect(model)}
              className={`relative rounded-2xl p-4.5 border transition-all duration-300 cursor-pointer flex flex-col justify-between bg-black/40 backdrop-blur-xl ${
                isSelected
                  ? `bg-gradient-to-b ${model.color} ${model.accentBorder} scale-[1.02]`
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Active Selection Pin */}
              {isSelected && (
                <div className="absolute top-3 left-3 bg-emerald-500 text-black p-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    {renderIcon(model.icon)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-wide">
                      {model.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {model.provider}
                    </div>
                  </div>
                </div>

                <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 mb-2">
                  {model.badge}
                </div>

                <p className="text-xs text-gray-300/90 leading-relaxed line-clamp-2 mb-3">
                  {model.description}
                </p>
              </div>

              {/* Custom Input for 'Other' */}
              {model.isCustom && (
                <div className="mt-2 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <input
                      type="text"
                      value={localCustomName}
                      onChange={(e) => setLocalCustomName(e.target.value)}
                      placeholder="ناوی مۆدێل بنووسە (نموونە: Llama 3.3 / Grok 3)"
                      className="w-full bg-black/50 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-purple-400 transition-all font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect(model)}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 rounded-xl transition-all"
                  >
                    جێگیرکردنی مۆدێلی تایبەت
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] font-medium pt-2 border-t border-white/5">
                <span className="text-gray-400">{model.tagline}</span>
                <span className={`font-bold ${isSelected ? "text-emerald-400" : "text-gray-400"}`}>
                  {isSelected ? "هەڵبژێردراوە ✓" : "هەڵبژاردن ←"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full max-w-4xl bg-[#0b0f17] border border-white/20 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
      {content}
    </div>
  );
}
