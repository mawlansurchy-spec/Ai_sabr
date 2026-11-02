import { useState, useEffect, useRef, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  BarChart2,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

interface Candle {
  datetime: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceData {
  symbol: string;
  name?: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previous_close: number;
  change: number;
  percent_change: number;
  datetime: string;
  timestamp: number;
  source: string;
  configured: boolean;
}

const TIMEFRAMES = [
  { label: "1 خولەک (1M)", value: "1min" },
  { label: "5 خولەک (5M)", value: "5min" },
  { label: "15 خولەک (15M)", value: "15min" },
  { label: "30 خولەک (30M)", value: "30min" },
  { label: "1 کاتژمێر (1H)", value: "1h" },
  { label: "4 کاتژمێر (4H)", value: "4h" },
  { label: "1 ڕۆژ (1D)", value: "1day" },
];

export function NexusGoldTerminal() {
  const [selectedInterval, setSelectedInterval] = useState<string>("15min");
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [candleError, setCandleError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isPlaceholderKey, setIsPlaceholderKey] = useState<boolean>(false);
  const [currentConfigVal, setCurrentConfigVal] = useState<string | null>(null);
  const [apiSolution, setApiSolution] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const chartRef = useRef<HTMLDivElement>(null);

  // Resize observer to ensure SVG adapts seamlessly to screen size
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch Gold Price from backend Twelve Data endpoint
  const fetchPrice = async () => {
    setIsLoadingPrice(true);
    setPriceError(null);
    try {
      const res = await fetch("/api/gold-price");
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        setPriceError(data.error || "Failed to fetch live gold price");
        setIsConfigured(data.configured !== false);
        setIsPlaceholderKey(Boolean(data.isPlaceholder));
        setApiSolution(data.solution || null);
        setCurrentConfigVal(data.currentValue || null);
        setPriceData(null);
      } else {
        setPriceData(data);
        setIsConfigured(true);
        setIsPlaceholderKey(false);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      setPriceError(err.message || "Network error fetching gold price");
      setPriceData(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Fetch Gold Candlesticks from backend Twelve Data endpoint
  const fetchCandles = async (interval: string) => {
    setIsLoadingCandles(true);
    setCandleError(null);
    try {
      const res = await fetch(`/api/gold-candles?interval=${interval}`);
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        setCandleError(data.error || "Failed to fetch gold candlestick data");
        setIsConfigured(data.configured !== false);
        setIsPlaceholderKey(Boolean(data.isPlaceholder));
        setApiSolution(data.solution || null);
        setCurrentConfigVal(data.currentValue || null);
        setCandles([]);
      } else {
        if (Array.isArray(data.candles)) {
          setCandles(data.candles);
        } else {
          setCandles([]);
        }
        setIsConfigured(true);
        setIsPlaceholderKey(false);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      setCandleError(err.message || "Network error fetching candlestick series");
      setCandles([]);
    } finally {
      setIsLoadingCandles(false);
    }
  };

  // Initial load and interval change
  useEffect(() => {
    fetchPrice();
    fetchCandles(selectedInterval);

    // Auto-refresh price every 30 seconds
    const intervalTimer = setInterval(() => {
      fetchPrice();
    }, 30000);

    return () => clearInterval(intervalTimer);
  }, [selectedInterval]);

  const handleRefreshAll = () => {
    fetchPrice();
    fetchCandles(selectedInterval);
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 360;
  const padding = { top: 25, right: 65, bottom: 35, left: 20 };
  const innerWidth = Math.max(200, containerWidth - padding.left - padding.right);
  const innerHeight = Math.max(100, chartHeight - padding.top - padding.bottom);

  const { minPrice, maxPrice, priceRange, candleWidth, points } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 0, priceRange: 1, candleWidth: 8, points: [] };
    }

    let min = Infinity;
    let max = -Infinity;

    for (const c of candles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    }

    // Add 8% buffer above and below for breathing room
    const rawRange = max - min;
    const buffer = rawRange > 0 ? rawRange * 0.08 : 2;
    const finalMin = min - buffer;
    const finalMax = max + buffer;
    const finalRange = Math.max(0.01, finalMax - finalMin);

    const stepX = innerWidth / candles.length;
    const cWidth = Math.max(2, Math.min(16, stepX * 0.72));

    const mapped = candles.map((c, i) => {
      const cx = padding.left + i * stepX + stepX / 2;
      const yHigh = padding.top + innerHeight - ((c.high - finalMin) / finalRange) * innerHeight;
      const yLow = padding.top + innerHeight - ((c.low - finalMin) / finalRange) * innerHeight;
      const yOpen = padding.top + innerHeight - ((c.open - finalMin) / finalRange) * innerHeight;
      const yClose = padding.top + innerHeight - ((c.close - finalMin) / finalRange) * innerHeight;
      const isBullish = c.close >= c.open;

      return {
        ...c,
        cx,
        yHigh,
        yLow,
        yOpen,
        yClose,
        bodyTop: Math.min(yOpen, yClose),
        bodyHeight: Math.max(1.5, Math.abs(yClose - yOpen)),
        isBullish,
      };
    });

    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      priceRange: finalRange,
      candleWidth: cWidth,
      points: mapped,
    };
  }, [candles, innerWidth, innerHeight, padding]);

  // Generate 5 horizontal price axis gridlines
  const gridLines = useMemo(() => {
    if (minPrice === 0 && maxPrice === 0) return [];
    const count = 5;
    const lines = [];
    for (let i = 0; i <= count; i++) {
      const price = minPrice + (priceRange / count) * i;
      const y = padding.top + innerHeight - (i / count) * innerHeight;
      lines.push({ price, y });
    }
    return lines;
  }, [minPrice, maxPrice, priceRange, innerHeight, padding]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="w-full rounded-2xl bg-[#090c13] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] overflow-hidden text-gray-200">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Connection Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/30 via-amber-500/20 to-black border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                NEXUS AI • تێرمیناڵی زێڕی جیهانی (XAU/USD)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                Twelve Data API
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              مارکێتی ڕاستەوخۆ بەپێی ستانداردەکانی وەبەرهێنانی بانکی و ICT
            </p>
          </div>
        </div>

        {/* Status Badge & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Connection Status Indicator */}
          {isConfigured === false ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>کلیلی TWELVE_DATA_API_KEY دانەنراوە</span>
            </div>
          ) : priceError || candleError ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>کێشەی بەستنەوەی API</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>پەیوەستە بە Twelve Data REST</span>
            </div>
          )}

          {/* Last Update */}
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 font-mono bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-3 h-3 text-[#d4af37]" />
              <span>{lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}

          {/* Manual Refresh Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isLoadingPrice || isLoadingCandles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="نوێکردنەوەی نرخی زێڕ و مۆمەکان"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrice || isLoadingCandles ? "animate-spin text-[#d4af37]" : ""}`} />
            <span>نوێکردنەوە</span>
          </button>
        </div>
      </div>

      {/* Primary Price Summary Bar */}
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5">
        {/* Current Live Price */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-gray-400 font-bold mb-1">نرخی ئێستای زێڕ (XAU/USD)</div>
          {isLoadingPrice && !priceData ? (
            <div className="h-8 w-24 bg-white/10 animate-pulse rounded"></div>
          ) : priceData ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                ${priceData.price.toFixed(2)}
              </span>
              <span
                className={`text-xs font-mono font-bold flex items-center ${
                  priceData.change >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {priceData.change >= 0 ? <TrendingUp className="w-3 h-3 ml-0.5" /> : <TrendingDown className="w-3 h-3 ml-0.5" />}
                {priceData.change >= 0 ? "+" : ""}
                {priceData.change.toFixed(2)} ({priceData.percent_change.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <div className="text-sm font-mono text-zinc-500">بەردەست نییە</div>
          )}
        </div>

        {/* 24h High */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-gray-400 font-bold mb-1">بەرزترین نرخی ڕۆژ (High)</div>
          <div className="text-lg font-mono font-extrabold text-emerald-400">
            {priceData ? `$${priceData.high.toFixed(2)}` : "—"}
          </div>
        </div>

        {/* 24h Low */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-gray-400 font-bold mb-1">نزمترین نرخی ڕۆژ (Low)</div>
          <div className="text-lg font-mono font-extrabold text-rose-400">
            {priceData ? `$${priceData.low.toFixed(2)}` : "—"}
          </div>
        </div>

        {/* Open Price */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] text-gray-400 font-bold mb-1">نرخی کردنەوە (Open)</div>
          <div className="text-lg font-mono font-extrabold text-zinc-300">
            {priceData ? `$${priceData.open.toFixed(2)}` : "—"}
          </div>
        </div>
      </div>

      {/* Error Banner when Twelve Data returns an issue */}
      {(priceError || candleError || isConfigured === false) && (
        <div className="m-4 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-bold text-red-300 flex items-center gap-2 flex-wrap">
                <span>کێشەی بەستنەوەی Twelve Data Gold Market API</span>
                {isPlaceholderKey && (
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-mono">
                    INVALID_OR_PLACEHOLDER_KEY
                  </span>
                )}
                {isConfigured === false && !isPlaceholderKey && (
                  <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded border border-red-500/40 font-mono">
                    CONFIG_MISSING
                  </span>
                )}
              </div>

              <p className="text-red-200/95 leading-relaxed font-mono">
                {priceError || candleError || "پێویستە کلیلی TWELVE_DATA_API_KEY لە گۆڕاوە ژینگەییەکان دیاری بکرێت."}
              </p>

              {currentConfigVal && (
                <div className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-1 rounded border border-white/5 my-1">
                  بەهای وەرگیراو لە سێرڤەر: <span className="text-amber-300 break-all">{currentConfigVal}</span>
                </div>
              )}

              {/* Actionable guidance box */}
              <div className="mt-2.5 p-3 rounded-lg bg-black/60 border border-white/10 text-xs text-gray-300 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>هۆکار و ڕێنمایی چارەسەرکردن:</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {isPlaceholderKey || String(priceError).includes("YOUR_API_KEY")
                    ? "تۆ لینکی نموونەیی یان دەقی «YOUR_API_KEY»ت داناوە لەبری کلیلی ڕاستەقینە. کلیلی Twelve Data لینک نییە، بەڵکو کۆدێکی کورتە وەک (c8f12a34...)."
                    : apiSolution || "دڵنیابەرەوە لە بوونی کلیلێکی دروست لە ئەکاونتی Twelve Data."}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400 pr-1 mt-1">
                  <li>
                    سەردانی <a href="https://twelvedata.com/pricing" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline font-bold">twelvedata.com/pricing</a> بکە و بە بێبەرامبەر (Free) خۆت تۆمار بکە.
                  </li>
                  <li>لە داشبۆردی twelvedata کۆدی <strong>API key</strong>ەکەت کۆپی بکە (٣٢ پیت و ژمارەیە).</li>
                  <li>
                    لە بەشی <strong>Secrets</strong>ی ئەم پڕۆژەیە، گۆڕاوی <code className="text-[#d4af37] bg-white/5 px-1 py-0.5 rounded font-mono">TWELVE_DATA_API_KEY</code> نوێ بکەرەوە بەو کۆدە (تەنها کۆدەکە بە بێ هیچ لینکی پێشەوە).
                  </li>
                  <li>پاشان کلیک لەسەر دوگمەی «تاقیکردنەوەی دووبارە» بکە.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={handleRefreshAll}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 font-bold text-xs shrink-0 cursor-pointer active:scale-95"
            >
              تاقیکردنەوەی دووبارە
            </button>
          </div>
        </div>
      )}

      {/* Timeframe Selector & Active Candle Info Bar */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          <span className="text-xs text-gray-400 font-bold ml-1 shrink-0">تایم فریم:</span>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedInterval(tf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                selectedInterval === tf.value
                  ? "bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Active/Hovered Candle Inspection (OHLC) */}
        {activeCandle && (
          <div className="flex items-center gap-3 text-xs font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide">
            <span className="text-gray-400 shrink-0">{activeCandle.datetime}:</span>
            <span className="text-gray-300 shrink-0">O: <strong className="text-white">${activeCandle.open.toFixed(2)}</strong></span>
            <span className="text-emerald-400 shrink-0">H: <strong>${activeCandle.high.toFixed(2)}</strong></span>
            <span className="text-rose-400 shrink-0">L: <strong>${activeCandle.low.toFixed(2)}</strong></span>
            <span className={`shrink-0 ${activeCandle.close >= activeCandle.open ? "text-emerald-400" : "text-rose-400"}`}>
              C: <strong>${activeCandle.close.toFixed(2)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Interactive Candlestick Chart Canvas */}
      <div className="p-4 relative" ref={chartRef}>
        {isLoadingCandles && candles.length === 0 ? (
          <div className="h-[360px] w-full flex flex-col items-center justify-center gap-3 bg-black/30 rounded-xl">
            <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
            <div className="text-xs font-mono text-gray-400">
              داتای ڕاستەقینەی مۆمەکان لە Twelve Data وەردەگیرێت...
            </div>
          </div>
        ) : candles.length === 0 ? (
          <div className="h-[360px] w-full flex flex-col items-center justify-center gap-3 bg-black/30 rounded-xl border border-dashed border-white/10 p-6 text-center">
            <BarChart2 className="w-12 h-12 text-zinc-600" />
            <div className="text-sm font-bold text-gray-300">
              هیچ داتایەکی مۆم بەردەست نییە
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              بەپێی ڕێنماییەکان، داتای وەهمی یان دروستکراو بەکارناهێنرێت. تکایە دڵنیابەرەوە لە کلیلی TWELVE_DATA_API_KEY.
            </p>
          </div>
        ) : (
          <div className="relative">
            <svg
              width={containerWidth}
              height={chartHeight}
              className="overflow-visible select-none cursor-crosshair"
              onMouseLeave={() => setHoveredCandle(null)}
            >
              <defs>
                <linearGradient id="bullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="bearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Background horizontal grid lines & Price labels */}
              {gridLines.map((line, idx) => (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={line.y}
                    x2={padding.left + innerWidth}
                    y2={line.y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left + innerWidth + 8}
                    y={line.y + 4}
                    fill="rgba(212, 175, 55, 0.75)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ${line.price.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Candlesticks Rendering */}
              {points.map((c, i) => {
                const color = c.isBullish ? "#10b981" : "#ef4444";
                const isHovered = hoveredCandle?.datetime === c.datetime;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredCandle(c)}
                    className="transition-opacity hover:opacity-100"
                  >
                    {/* Wick Line */}
                    <line
                      x1={c.cx}
                      y1={c.yHigh}
                      x2={c.cx}
                      y2={c.yLow}
                      stroke={color}
                      strokeWidth={isHovered ? "2" : "1.2"}
                      opacity={isHovered ? "1" : "0.85"}
                    />

                    {/* Candle Body */}
                    <rect
                      x={c.cx - candleWidth / 2}
                      y={c.bodyTop}
                      width={candleWidth}
                      height={c.bodyHeight}
                      fill={c.isBullish ? "url(#bullGradient)" : "url(#bearGradient)"}
                      stroke={color}
                      strokeWidth={isHovered ? "2" : "0.5"}
                      rx={1}
                      filter={isHovered ? "drop-shadow(0 0 6px rgba(255,255,255,0.4))" : undefined}
                    />

                    {/* Hover vertical crosshair */}
                    {isHovered && (
                      <line
                        x1={c.cx}
                        y1={padding.top}
                        x2={c.cx}
                        y2={padding.top + innerHeight}
                        stroke="rgba(212, 175, 55, 0.5)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}

              {/* Bottom Time Axis Markers */}
              {points.filter((_, idx) => idx % Math.max(1, Math.floor(points.length / 6)) === 0).map((c, idx) => (
                <text
                  key={idx}
                  x={c.cx}
                  y={padding.top + innerHeight + 20}
                  fill="rgba(156, 163, 175, 0.8)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {c.datetime.split(" ")[1] || c.datetime}
                </text>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Terminal Footer Info */}
      <div className="px-4 py-3 bg-black/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>داتای زێڕ بە شێوەی ڕاستەوخۆ لە کارگەی بازاڕەکانی Twelve Data وەردەگیرێت بە بێ هیچ داتایەکی دروستکراو.</span>
        </div>
        <div className="text-[11px] font-mono text-[#d4af37]/80">
          XAU/USD • Spot Gold • Standard Institutional Feed
        </div>
      </div>
    </div>
  );
}
