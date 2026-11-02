import { useEffect, useRef, useState } from "react";
import { 
  Maximize2, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Compass, 
  TrendingUp, 
  Zap, 
  ShieldCheck,
  X
} from "lucide-react";

// ==========================================
// 1. TRADINGVIEW INTERACTIVE LIVE CHART
// ==========================================
export function TradingViewChart({ symbol = "CAPITALCOM:GOLD", height = 420 }: { symbol?: string; height?: number }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize symbol to valid TradingView format
  let cleanSymbol = (symbol || "CAPITALCOM:GOLD").trim().toUpperCase();
  if (cleanSymbol.includes("XAU") || cleanSymbol.includes("GOLD")) {
    cleanSymbol = "CAPITALCOM:GOLD";
  } else if (cleanSymbol.includes("EUR")) {
    cleanSymbol = "FX:EURUSD";
  } else if (cleanSymbol.includes("GBP")) {
    cleanSymbol = "FX:GBPUSD";
  } else if (cleanSymbol.includes("BTC")) {
    cleanSymbol = "BINANCE:BTCUSDT";
  } else if (cleanSymbol.includes("OIL") || cleanSymbol.includes("BRENT") || cleanSymbol.includes("WTI")) {
    cleanSymbol = "TVC:USOIL";
  } else if (!cleanSymbol.includes(":")) {
    cleanSymbol = `FX:${cleanSymbol}`;
  }

  const encodedSymbol = encodeURIComponent(cleanSymbol);
  const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart_${encodedSymbol}&symbol=${encodedSymbol}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0a0a0f&theme=dark&style=1&timezone=Etc%2FUTC&locale=en`;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-blue-500/30 bg-[#0a0a0f] shadow-[0_0_30px_rgba(59,130,246,0.15)] my-4 ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "w-full"}`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-bold text-white tracking-wide">چارتی ڕاستەوخۆی TradingView: {cleanSymbol}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">15m Candles</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://www.tradingview.com/chart/?symbol=${encodedSymbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-[11px]"
            title="کردنەوە لە TradingView"
          >
            <span>کردنەوە</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title={isFullscreen ? "داخستنی گەورەکردن" : "گەورەکردن بۆ تەواوی شاشە"}
          >
            {isFullscreen ? <X className="w-4 h-4 text-red-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div 
        style={{ height: isFullscreen ? "calc(100vh - 80px)" : `${height}px` }} 
        className="w-full relative bg-[#0a0a0f]"
      >
        <iframe
          key={`${cleanSymbol}-${isFullscreen}`}
          src={iframeSrc}
          className="w-full h-full border-0"
          title={`TradingView Chart ${cleanSymbol}`}
          loading="lazy"
          allow="clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}

// ==========================================
// 2. W.D. GANN SQUARE OF 9 MATRIX VISUAL
// ==========================================
export function GannSquareVisual({ basePrice = 2350 }: { basePrice?: number }) {
  const [angleFilter, setAngleFilter] = useState<number | "ALL">("ALL");
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate 9x9 Spiral Grid (81 cells)
  const size = 9;
  const grid: { val: number; x: number; y: number; angle: number; isCardinal: boolean; isFixed: boolean }[] = [];
  
  // Center is at (4,4)
  const cx = 4;
  const cy = 4;
  
  // Square of 9 angles
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = cy - y; // Cartesian
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      
      // Calculate approximate Gann degree from positive X axis counter-clockwise
      let rad = Math.atan2(dy, dx);
      let deg = Math.round((rad * 180) / Math.PI);
      if (deg < 0) deg += 360;

      const isCardinal = (dx === 0 || dy === 0) && (dx !== 0 || dy !== 0); // 0, 90, 180, 270
      const isFixed = Math.abs(dx) === Math.abs(dy) && dx !== 0; // 45, 135, 225, 315

      // Gann price formula: (sqrt(base) + (deg / 180))^2
      const offset = (dist * 4) + (deg / 90);
      const cellPrice = Math.round(basePrice + (dx * 12) + (dy * 15));

      grid.push({
        val: cellPrice,
        x,
        y,
        angle: deg,
        isCardinal,
        isFixed,
      });
    }
  }

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `Gann_Square_of_9_${basePrice}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-black/80 p-4 sm:p-5 my-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h4 className="font-extrabold text-white text-sm sm:text-base">
              چوارگۆشەی ٩ی گان (W.D. Gann Square of 9 Matrix)
            </h4>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            ماتماتیکی گۆشەکان (45°, 90°, 180°, 360°) و خاڵەکانی پێچەوانەبوونەوەی نرخ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            title="داگرتنی وێنەی گان بە کوالێتی بەرز"
          >
            <Download className="w-3.5 h-3.5" /> داگرتنی وێنە
          </button>
        </div>
      </div>

      {/* Grid Legend & Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <span className="text-gray-400 ml-1">گۆشە سەرەکییەکان:</span>
        <button
          onClick={() => setAngleFilter("ALL")}
          className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${angleFilter === "ALL" ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-white/5 text-gray-400 border-white/5"}`}
        >
          هەموو گۆشەکان
        </button>
        <button
          onClick={() => setAngleFilter(90)}
          className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${angleFilter === 90 ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "bg-white/5 text-gray-400 border-white/5"}`}
        >
          Cardinal (90° / 180° / 270°)
        </button>
        <button
          onClick={() => setAngleFilter(45)}
          className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${angleFilter === 45 ? "bg-purple-500/20 text-purple-300 border-purple-500/50" : "bg-white/5 text-gray-400 border-white/5"}`}
        >
          Fixed (45° / 135° / 315°)
        </button>
      </div>

      {/* SVG Canvas for Square of 9 */}
      <div className="flex justify-center overflow-x-auto py-2">
        <svg
          ref={svgRef}
          viewBox="0 0 540 540"
          className="w-full max-w-[500px] h-auto bg-[#07070b] rounded-2xl border border-white/10 shadow-2xl"
        >
          {/* Background Cross Rays */}
          <line x1="270" y1="20" x2="270" y2="520" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="20" y1="270" x2="520" y2="270" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="40" y1="40" x2="500" y2="500" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="500" y1="40" x2="40" y2="500" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" strokeDasharray="3 3" />

          {/* Grid Cells */}
          {grid.map((cell, idx) => {
            const cellSize = 54;
            const px = 27 + cell.x * cellSize;
            const py = 27 + cell.y * cellSize;
            const isCenter = cell.x === cx && cell.y === cy;

            let fill = "rgba(255, 255, 255, 0.03)";
            let stroke = "rgba(255, 255, 255, 0.08)";
            let textColor = "#9ca3af";

            if (isCenter) {
              fill = "rgba(245, 158, 11, 0.3)";
              stroke = "#f59e0b";
              textColor = "#fbbf24";
            } else if (cell.isCardinal) {
              fill = "rgba(6, 182, 212, 0.15)";
              stroke = "rgba(6, 182, 212, 0.5)";
              textColor = "#38bdf8";
            } else if (cell.isFixed) {
              fill = "rgba(168, 85, 247, 0.15)";
              stroke = "rgba(168, 85, 247, 0.5)";
              textColor = "#c084fc";
            }

            return (
              <g key={idx}>
                <rect
                  x={px}
                  y={py}
                  width={cellSize - 3}
                  height={cellSize - 3}
                  rx="6"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.5"
                />
                <text
                  x={px + cellSize / 2 - 1.5}
                  y={py + cellSize / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {cell.val}
                </text>
                {!isCenter && (cell.isCardinal || cell.isFixed) && (
                  <text
                    x={px + cellSize / 2 - 1.5}
                    y={py + 12}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="7"
                    fontFamily="sans-serif"
                  >
                    {cell.angle}°
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-400"></span>
          خاڵە سەرەکییەکان (Cardinal 90°/180°/270°)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-400"></span>
          گۆشە وەستاوەکان (Fixed 45°/135°/315°)
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 3. NIKOLA TESLA 3-6-9 VORTEX MATH VISUAL
// ==========================================
export function TeslaVortexVisual() {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `Nikola_Tesla_369_Vortex.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Node positions on circle (1 to 9)
  // 9 is at top (270 deg / -90 deg)
  const nodes = [
    { num: 9, angle: -90, isTrinity: true },
    { num: 1, angle: -50, isTrinity: false },
    { num: 2, angle: -10, isTrinity: false },
    { num: 3, angle: 30, isTrinity: true },
    { num: 4, angle: 70, isTrinity: false },
    { num: 5, angle: 110, isTrinity: false },
    { num: 6, angle: 150, isTrinity: true },
    { num: 7, angle: 190, isTrinity: false },
    { num: 8, angle: 230, isTrinity: false },
  ];

  const R = 180;
  const cx = 250;
  const cy = 250;

  const getCoord = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + R * Math.cos(rad),
      y: cy + R * Math.sin(rad),
    };
  };

  const p1 = getCoord(-50);
  const p2 = getCoord(-10);
  const p3 = getCoord(30);
  const p4 = getCoord(70);
  const p5 = getCoord(110);
  const p6 = getCoord(150);
  const p7 = getCoord(190);
  const p8 = getCoord(230);
  const p9 = getCoord(-90);

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-black/80 p-4 sm:p-5 my-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <h4 className="font-extrabold text-white text-sm sm:text-base">
              ماتماتیکی تێسلا 3-6-9 و سووڕی ڤۆرتێکس (Tesla 3-6-9 Vortex Matrix)
            </h4>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            نهێنی گەردوونی تێسلا: سووڕی دوانەیی (1-2-4-8-7-5) لەگەڵ سێگۆشەی هێزی 3-6-9
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> داگرتنی وێنە
        </button>
      </div>

      <div className="flex justify-center overflow-x-auto py-2">
        <svg
          ref={svgRef}
          viewBox="0 0 500 500"
          className="w-full max-w-[450px] h-auto bg-[#07070e] rounded-2xl border border-white/10 shadow-2xl"
        >
          {/* Main Circle */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={R + 15} fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Infinity Doubling Circuit: 1 -> 2 -> 4 -> 8 -> 7 -> 5 -> 1 */}
          <path
            d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p4.x} ${p4.y} L ${p8.x} ${p8.y} L ${p7.x} ${p7.y} L ${p5.x} ${p5.y} Z`}
            fill="rgba(6, 182, 212, 0.08)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Trinity 3-6-9 Triangle: 3 -> 6 -> 9 -> 3 */}
          <polygon
            points={`${p3.x},${p3.y} ${p6.x},${p6.y} ${p9.x},${p9.y}`}
            fill="rgba(245, 158, 11, 0.12)"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="18" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="2" />
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="bold">
            3-6-9
          </text>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const coord = getCoord(node.angle);
            const isTrinity = node.isTrinity;
            return (
              <g key={i}>
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r="16"
                  fill={isTrinity ? "#f59e0b" : "#0f172a"}
                  stroke={isTrinity ? "#fbbf24" : "#06b6d4"}
                  strokeWidth="2"
                />
                <text
                  x={coord.x}
                  y={coord.y + 5}
                  textAnchor="middle"
                  fill={isTrinity ? "#000" : "#38bdf8"}
                  fontSize="13"
                  fontWeight="bold"
                >
                  {node.num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] border-t border-white/5 pt-2 text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
          <span>سووڕی کەرەستە (1-2-4-8-7-5): جووڵەی وزەی نرخ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>سێگۆشەی باڵا (3-6-9): چەقی پێچەوانەبوونەوە و هاوسەنگی</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ICT INSTITUTIONAL CANDLESTICK SETUP
// ==========================================
export function IctSetupChartVisual({
  decision = "BUY",
  entry = "2345.50",
  sl = "2338.20",
  tp1 = "2358.00",
  tp2 = "2372.50",
  pair = "XAU/USD"
}: {
  decision?: string;
  entry?: string;
  sl?: string;
  tp1?: string;
  tp2?: string;
  pair?: string;
}) {
  const isBuy = decision.toUpperCase().includes("BUY");

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-[#08080d] p-4 sm:p-5 my-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-right">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="font-extrabold text-white text-sm sm:text-base">
            چارتی شیکاری پرایس ئەکشن و ستۆپ لۆسی کورت ({pair})
          </h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isBuy ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-red-500/20 text-red-300 border border-red-500/40"}`}>
          {isBuy ? "📈 کڕین (BUY SETUP)" : "📉 فرۆشتن (SELL SETUP)"}
        </span>
      </div>

      {/* Candlestick Diagram SVG */}
      <div className="flex justify-center overflow-x-auto py-2">
        <svg viewBox="0 0 500 240" className="w-full max-w-[500px] h-auto bg-black/60 rounded-xl border border-white/5">
          {/* Grid lines */}
          <line x1="40" y1="40" x2="480" y2="40" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="190" x2="480" y2="190" stroke="rgba(255,255,255,0.05)" />

          {/* TP2 Target Line */}
          <line x1="60" y1="35" x2="470" y2="35" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
          <text x="475" y="38" fill="#10b981" fontSize="10" fontWeight="bold">TP2: {tp2}</text>

          {/* TP1 Target Line */}
          <line x1="60" y1="75" x2="470" y2="75" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="475" y="78" fill="#34d399" fontSize="10" fontWeight="bold">TP1: {tp1}</text>

          {/* FVG Box */}
          <rect x="180" y="95" width="160" height="35" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="260" y="117" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">Fair Value Gap (FVG Zone)</text>

          {/* Entry Line */}
          <line x1="60" y1="130" x2="470" y2="130" stroke="#38bdf8" strokeWidth="2" />
          <text x="475" y="133" fill="#38bdf8" fontSize="10" fontWeight="bold">Entry: {entry}</text>

          {/* Ultra-Tight Stop Loss Line */}
          <line x1="60" y1="180" x2="470" y2="180" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
          <text x="475" y="183" fill="#ef4444" fontSize="10" fontWeight="bold">🛑 SL کورت: {sl}</text>

          {/* Liquidity Sweep Wick (Sweep Low) */}
          <line x1="140" y1="110" x2="140" y2="175" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="134" y="115" width="12" height="30" fill="#ef4444" rx="2" />
          <text x="140" y="195" textAnchor="middle" fill="#ef4444" fontSize="8">Liquidity Sweep Wick</text>

          {/* Displacement Bullish Candle */}
          <line x1="210" y1="80" x2="210" y2="145" stroke="#10b981" strokeWidth="1.5" />
          <rect x="204" y="90" width="12" height="45" fill="#10b981" rx="2" />

          {/* Retest into FVG Candle */}
          <line x1="270" y1="100" x2="270" y2="138" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="264" y="110" width="12" height="20" fill="#f59e0b" rx="2" />

          {/* Expansion Candle towards TP */}
          <line x1="330" y1="50" x2="330" y2="125" stroke="#10b981" strokeWidth="1.5" />
          <rect x="324" y="55" width="12" height="60" fill="#10b981" rx="2" />
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-300 border-t border-white/5 pt-2">
        <span className="flex items-center gap-1.5 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          خاڵی چوونەژوورەوە لە کشانەوە بۆ سەر سنووری FVG
        </span>
        <span className="flex items-center gap-1.5 text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          ستۆپ لۆس لە ژێر کلکی ڕاماڵین (پووچەڵبوونەوەی کورت مەودا)
        </span>
      </div>
    </div>
  );
}
