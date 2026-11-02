import { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  FileImage, 
  Loader2, 
  Zap, 
  AlertTriangle, 
  Globe, 
  Clock, 
  Layers, 
  Sparkles,
  Maximize2,
  ExternalLink,
  Camera,
  TrendingUp,
  X,
  Copy,
  Check,
  BarChart2,
  MonitorPlay
} from "lucide-react";

interface UploadZoneProps {
  onUpload: (file: File, newsEvent?: string, pair?: string, timeframe?: string, aiModel?: string) => void;
  onDirectResult?: (item: any) => void;
  isUploading: boolean;
  mode?: "pure_chart" | "news_setup";
}

const NEWS_PRESETS = [
  { label: "NFP (داتای کار)", val: "NFP (Non-Farm Payrolls)" },
  { label: "CPI (هەڵاوسان)", val: "CPI (Consumer Price Index)" },
  { label: "FOMC / ڕێژەی سوود", val: "FOMC / Interest Rate Decision" },
  { label: "GDP (بەررهەمی ناوخۆیی)", val: "GDP Growth Rate" },
  { label: "PPI (نرخی بەرهەمهێنەران)", val: "PPI Data" },
  { label: "Geopolitical News (سیاسی)", val: "Geopolitical Event / Risk" },
];

const POPULAR_TV_SYMBOLS = [
  { label: "زێڕ (XAU/USD)", value: "CAPITALCOM:GOLD", pairName: "XAU/USD (Gold)" },
  { label: "یۆرۆ/دۆلار (EUR/USD)", value: "FX:EURUSD", pairName: "EUR/USD" },
  { label: "پاوەند/دۆلار (GBP/USD)", value: "FX:GBPUSD", pairName: "GBP/USD" },
  { label: "دۆلار/یەن (USD/JPY)", value: "FX:USDJPY", pairName: "USD/JPY" },
  { label: "بیتکۆین (BTC/USDT)", value: "BINANCE:BTCUSDT", pairName: "BTC/USDT" },
  { label: "نەوتی خاو (WTI Oil)", value: "TVC:USOIL", pairName: "WTI Oil" },
  { label: "نازداک (Nasdaq 100)", value: "CAPITALCOM:US100", pairName: "US100 (Nasdaq)" },
];

const TIMEFRAMES = [
  { label: "M1", tvInterval: "1" },
  { label: "M5", tvInterval: "5" },
  { label: "M15", tvInterval: "15" },
  { label: "H1", tvInterval: "60" },
  { label: "H4", tvInterval: "240" },
  { label: "D1", tvInterval: "D" },
];

export function UploadZone({ onUpload, onDirectResult, isUploading, mode = "pure_chart" }: UploadZoneProps) {
  // View mode: both (Dual view), chart_only (TradingView Live), or upload_only (Drag & Drop)
  const [viewMode, setViewMode] = useState<"both" | "chart_only" | "upload_only">("both");

  // TradingView Interactive Chart State
  const [selectedTvSymbol, setSelectedTvSymbol] = useState<string>("CAPITALCOM:GOLD");
  const [customTvSymbol, setCustomTvSymbol] = useState<string>("");
  const [selectedTvInterval, setSelectedTvInterval] = useState<string>("15");
  const [isTvFullscreen, setIsTvFullscreen] = useState(false);
  const [isCapturingLiveChart, setIsCapturingLiveChart] = useState(false);
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  // Upload & File State
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [newsEvent, setNewsEvent] = useState<string>("CPI (Consumer Price Index)");
  const [pair, setPair] = useState<string>("XAU/USD (Gold)");
  const [timeframe, setTimeframe] = useState<string>("M15");
  const [customNews, setCustomNews] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [liveTvError, setLiveTvError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const compressImage = (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= 400 * 1024 && file.type === "image/jpeg") {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("تکایە تەنیا فایلی وێنە (Image) هەڵبژێرە.");
      return;
    }

    setIsProcessingFile(true);
    try {
      const optimizedFile = await compressImage(file);
      setSelectedFile(optimizedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(optimizedFile);
    } catch (e) {
      console.error("Compression error", e);
      setSelectedFile(file);
      setIsProcessingFile(false);
    }
  };

  // Support Ctrl+V paste from clipboard directly on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          handleFileSelected(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("تکایە سەرەتا وێنەی چارتەکە هەڵبژێرە یان کێشانی ڕاستەوخۆ دیاری بکە.");
      return;
    }
    const finalNews = mode === "news_setup" ? (newsEvent === "custom" ? customNews : newsEvent) : "";
    onUpload(selectedFile, finalNews, pair, timeframe);
  };

  // Helper to directly trigger live TradingView analysis
  const handleAnalyzeLiveTradingView = async () => {
    setIsCapturingLiveChart(true);
    setLiveTvError(null);
    const cleanSymbol = customTvSymbol.trim() || selectedTvSymbol;
    const matchedPair = POPULAR_TV_SYMBOLS.find(s => s.value === cleanSymbol)?.pairName || cleanSymbol;
    const tfLabel = TIMEFRAMES.find(t => t.tvInterval === selectedTvInterval)?.label || "M15";
    const finalNews = mode === "news_setup" ? (newsEvent === "custom" ? customNews : newsEvent) : "";

    try {
      // 1. Direct call to server live TradingView market endpoint
      const response = await fetch("/api/analyze-tradingview-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: cleanSymbol,
          timeframe: tfLabel,
          mode,
          news_event: finalNews,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.item) {
          if (data.item.image || data.item.chartImage) {
            setPreview(data.item.image || data.item.chartImage);
          }
          setPair(matchedPair);
          setTimeframe(tfLabel);
          if (onDirectResult) {
            onDirectResult(data.item);
          }
          setIsCapturingLiveChart(false);
          return;
        }
      }

      const errData = await response.json().catch(() => null);
      throw new Error(errData?.message || "سێرڤەر وەڵامی شیکاری ڕاستەوخۆی نەدایەوە.");
    } catch (directErr: any) {
      console.warn("Direct live scan error:", directErr);
      const errMsg = directErr?.message || "کێشەیەک لە پەیوەندیکردن بە سێرڤەر ڕوویدا.";
      setLiveTvError(errMsg);
      setIsCapturingLiveChart(false);
    }
  };

  const activeTvSymbol = customTvSymbol.trim() || selectedTvSymbol;
  const encodedTvSymbol = encodeURIComponent(activeTvSymbol);
  const tvIframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tv_embed_${encodedTvSymbol}&symbol=${encodedTvSymbol}&interval=${selectedTvInterval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0a0a0f&theme=dark&style=1&timezone=Etc%2FUTC&locale=en`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top View Selector: Live TradingView Chart, Upload Zone, or Dual View */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-2 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 px-2 text-xs font-bold text-gray-300">
          <MonitorPlay className="w-4 h-4 text-emerald-400" />
          <span>شێوازی کارکردن:</span>
        </div>

        <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "both"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>چارتی TV + بارکردنی وێنە (Dual)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("chart_only")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "chart_only"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>تەنیا چارتی TradingView</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("upload_only")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "upload_only"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>تەنیا بارکردنی وێنە (Upload / Paste)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TRADINGVIEW LIVE INTERACTIVE CHART SECTION */}
      {/* ======================================================== */}
      {(viewMode === "both" || viewMode === "chart_only") && (
        <div className={`relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-[#090b10] shadow-[0_0_35px_rgba(16,185,129,0.12)] transition-all ${
          isTvFullscreen ? "fixed inset-4 z-50 shadow-2xl flex flex-col" : "w-full"
        }`}>
          {/* Chart Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-black/60 border-b border-white/10 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-extrabold text-white tracking-wide text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                چارتی ڕاستەوخۆی TradingView:
              </span>
              <span className="font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {activeTvSymbol}
              </span>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2">
              <a
                href={`https://www.tradingview.com/chart/?symbol=${encodedTvSymbol}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10 text-xs font-medium"
                title="کردنەوە لە ماڵپەڕی TradingView"
              >
                <span>کردنەوە لە TV</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>

              <button
                type="button"
                onClick={() => setIsTvFullscreen(!isTvFullscreen)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
                title={isTvFullscreen ? "داخستنی گەورەکردن" : "گەورەکردن بۆ تەواوی شاشە"}
              >
                {isTvFullscreen ? <X className="w-4 h-4 text-red-400" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Symbol & Timeframe Quick Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/40 border-b border-white/5 text-xs">
            {/* Symbol Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              <span className="text-gray-400 font-medium whitespace-nowrap">جووتە دراو:</span>
              {POPULAR_TV_SYMBOLS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setSelectedTvSymbol(s.value);
                    setCustomTvSymbol("");
                    setPair(s.pairName);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                    selectedTvSymbol === s.value && !customTvSymbol
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Timeframe Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium whitespace-nowrap">تایم فڕەیم:</span>
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.tvInterval}
                    type="button"
                    onClick={() => {
                      setSelectedTvInterval(tf.tvInterval);
                      setTimeframe(tf.label);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedTvInterval === tf.tvInterval
                        ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Embedded Interactive TradingView Widget */}
          <div 
            style={{ height: isTvFullscreen ? "calc(100vh - 180px)" : "520px" }}
            className="w-full relative bg-[#090b10]"
          >
            <iframe
              key={`${activeTvSymbol}-${selectedTvInterval}-${isTvFullscreen}`}
              src={tvIframeSrc}
              className="w-full h-full border-0"
              title={`TradingView Chart ${activeTvSymbol}`}
              loading="lazy"
              allow="clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>

          {/* Bottom Chart Action Bar: Instant Live Analysis & Screenshot Instructions */}
          <div className="p-3.5 bg-gradient-to-r from-black/90 via-emerald-950/30 to-black/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>کورتەباسی وێنەگرتن لە ترەیدینگ ڤیو:</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-mono font-bold border border-white/10">
                    Alt + S
                  </span>
                </p>
                <p className="text-[11px] text-gray-400">
                  لە چارتەکەدا Alt+S دابگرە بۆ Copy Image، پاشان لێرە Ctrl+V دابگرە بۆ پەیستکردنی دەستبەجێ.
                </p>
              </div>
            </div>

            {/* Direct Live Analysis Button */}
            <button
              type="button"
              onClick={handleAnalyzeLiveTradingView}
              disabled={isUploading || isCapturingLiveChart}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isCapturingLiveChart || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> وەرگرتنی داتای ڕاستەوخۆ لە TradingView و شیکاریکردن...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>وەرگرتنی داتای ڕاستەوخۆ لە TradingView و دەرکردنی سیگناڵ ({activeTvSymbol})</span>
                </>
              )}
            </button>
          </div>

          {liveTvError && (
            <div className="p-3 bg-red-500/10 border-t border-red-500/30 flex items-center justify-between text-xs text-red-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                <span>{liveTvError}</span>
              </span>
              <button
                type="button"
                onClick={() => setLiveTvError(null)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PARAMETERS SETUP (FOR NEWS OR SPECIFIC PAIR) */}
      {/* ======================================================== */}
      {mode === "news_setup" ? (
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">زانیاری هەواڵ و چارت (News & Pair Setup)</h3>
              <p className="text-xs text-gray-400">دیاریپێکردنی هەواڵە کاریگەرەکە و جووتە دراو بۆ شیکاری وردتر</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* News Event Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> ناوی هەواڵە کاریگەرەکە (High-Impact Event)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {NEWS_PRESETS.map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      setNewsEvent(preset.val);
                      setCustomNews("");
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold border text-right transition-all flex items-center justify-between ${
                      newsEvent === preset.val && !customNews
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span>{preset.label}</span>
                    {newsEvent === preset.val && !customNews && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  placeholder="یان هەواڵێکی تر بنووسە بە دەستی..."
                  value={customNews}
                  onChange={(e) => {
                    setCustomNews(e.target.value);
                    setNewsEvent("custom");
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Pair & Timeframe Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" /> دیاریکردنی جووتە دراو یان کانزا
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {POPULAR_TV_SYMBOLS.map((p) => (
                    <button
                      key={p.pairName}
                      type="button"
                      onClick={() => {
                        setPair(p.pairName);
                        setSelectedTvSymbol(p.value);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        pair === p.pairName
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {p.pairName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> تایم فڕەیمی وێنەی چارتەکە (Timeframe)
                </label>
                <div className="flex gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.label}
                      type="button"
                      onClick={() => {
                        setTimeframe(tf.label);
                        setSelectedTvInterval(tf.tvInterval);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        timeframe === tf.label
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ======================================================== */}
      {/* 3. DRAG & DROP / CLICK / PASTE CHART UPLOAD ZONE */}
      {/* ======================================================== */}
      {(viewMode === "both" || viewMode === "upload_only") && (
        <div className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-[32px] p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[220px] overflow-hidden group
              ${
                isDragActive
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-emerald-500/20 bg-black/30 hover:border-emerald-500/40 hover:bg-black/40"
              }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-emerald-500/[0.02] rounded-[32px] group-hover:bg-emerald-500/[0.05] transition-all pointer-events-none"></div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center text-emerald-400 z-10 relative">
                <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                <p className="text-lg font-bold text-white">پشکنین و شیکاری وردی ۱۲ میتۆدەکەی چارت لە کاردایە...</p>
                <p className="text-xs text-emerald-500/80 mt-2">قۆناغی ١: شیکاری پێکهاتە، SMC، ICT و ئیندیپێندێنتەکان ◀ قۆناغی ٢: دەرکردنی سیگناڵ</p>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center z-10 relative">
                <img src={preview} alt="Preview" className="max-h-56 rounded-2xl shadow-2xl mb-4 border border-white/10 object-contain" />
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <Check className="w-4 h-4" /> وێنەی چارتەکە ئامادەیە بۆ شیکاری
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setSelectedFile(null);
                    }}
                    className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/20 transition-colors"
                  >
                    سڕینەوە
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400 z-10 relative">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Upload the chart image (TradingView / MT5).
                </h3>
                <p className="text-xs text-gray-300 font-medium mb-1">
                  Drag & Drop or click to select an image in this section
                </p>
                <p className="text-[11px] text-emerald-400/90 font-mono mt-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Ctrl + V بۆ پەیستکردنی دەستبەجێ لە کلیپبۆرد بەردەستە
                </p>
              </div>
            )}
          </div>

          {/* Action Submit Button */}
          {selectedFile && !isUploading && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessingFile}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-base flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingFile ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> ئامادەکردنی وێنەی چارت...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-black" /> {mode === "news_setup" ? "دەستپێکردنی شیکاری وردی ۱۲ میتۆدەکە و سیگناڵ" : "دەستپێکردنی شیکاری وردی ۱۲ میتۆدەکە پێش سیگناڵ"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
