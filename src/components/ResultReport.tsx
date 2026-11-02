import { useState } from "react";
import Markdown from "react-markdown";
import { FullHistoryItem, SignalData, RiskManagementDetails } from "../types";
import { 
  Zap, 
  Copy, 
  Check, 
  ShieldAlert, 
  Clock, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Crosshair, 
  Layers, 
  Activity, 
  Globe,
  Sliders,
  Compass,
  BarChart3,
  Flame,
  LineChart,
  Boxes,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowDownCircle,
  FileText,
  Target
} from "lucide-react";

interface ResultReportProps {
  item: FullHistoryItem;
}

export function ResultReport({ item }: ResultReportProps) {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"all" | "structure" | "smc_ict" | "indicators" | "fundamentals" | "risk">("all");
  const [workflowStage, setWorkflowStage] = useState<"both" | "analysis_first" | "signal_only">("signal_only");

  let signalData: SignalData | null = null;
  try {
    if (item.parsed && typeof item.parsed === "object" && Object.keys(item.parsed).length > 0) {
      signalData = item.parsed;
    } else {
      let cleanReport = (item.report || item.signal_report || "")?.trim() || "";
      if (cleanReport.startsWith("```")) {
        cleanReport = cleanReport.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      const firstBrace = cleanReport.search(/[\{\[]/);
      const lastBrace = Math.max(cleanReport.lastIndexOf("}"), cleanReport.lastIndexOf("]"));
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleanReport = cleanReport.substring(firstBrace, lastBrace + 1);
      }
      signalData = cleanReport ? JSON.parse(cleanReport) : null;
    }
  } catch (e) {
    console.warn("Failed to parse signal report JSON:", e);
  }

  const isAdvanced = signalData && (signalData.final_decision || signalData.trading_pair);
  const decisionType = (signalData?.final_decision || signalData?.type || "NEUTRAL").toUpperCase();
  
  const isStrongBuy = decisionType.includes("STRONG BUY");
  const isStrongSell = decisionType.includes("STRONG SELL");
  const isBuy = !isStrongBuy && decisionType.includes("BUY");
  const isSell = !isStrongSell && decisionType.includes("SELL");

  // Calculate Pip difference
  const getPipText = (targetVal: any) => {
    if (!signalData || !signalData.entry || !targetVal) return "";
    const entryStr = String(signalData.entry).split("-")[0];
    const entry = parseFloat(entryStr.replace(/[^\d.]/g, ""));
    const target = parseFloat(String(targetVal).replace(/[^\d.]/g, ""));
    if (!entry || !target || isNaN(entry) || isNaN(target)) return "";
    const diff = Math.abs(target - entry);
    const pairUpper = (signalData.trading_pair || "").toUpperCase();

    let pips = 0;
    if (pairUpper.includes("XAU") || pairUpper.includes("GOLD")) {
      pips = Math.round(diff * 10);
    } else if (pairUpper.includes("JPY")) {
      pips = Math.round(diff * 100);
    } else if (pairUpper.includes("BTC") || pairUpper.includes("ETH") || pairUpper.includes("USDT")) {
      pips = Math.round(diff);
    } else {
      pips = Math.round(diff * 10000);
    }

    if (pips === 0) return "";
    return `+${pips} Pip (+${pips} پیپ)`;
  };

  // Calculate recommended Lot Size based on Account Balance, Risk %, and SL distance
  const calculateRecommendedLot = () => {
    if (!signalData || !signalData.entry || !signalData.sl) return "0.01";
    const entryNum = parseFloat(String(signalData.entry).split("-")[0].replace(/[^\d.]/g, ""));
    const slNum = parseFloat(String(signalData.sl).replace(/[^\d.]/g, ""));
    if (!entryNum || !slNum || isNaN(entryNum) || isNaN(slNum)) return "0.01";

    const riskAmount = (balance * riskPercent) / 100;
    const priceDiff = Math.abs(entryNum - slNum);

    const pairUpper = (signalData.trading_pair || "").toUpperCase();
    let pipSize = 0.0001;
    let pipValuePerStandardLot = 10; // $10 per pip for 1 standard lot

    if (pairUpper.includes("XAU") || pairUpper.includes("GOLD")) {
      pipSize = 0.1;
      pipValuePerStandardLot = 10;
    } else if (pairUpper.includes("JPY")) {
      pipSize = 0.01;
      pipValuePerStandardLot = 10;
    } else if (pairUpper.includes("BTC") || pairUpper.includes("ETH")) {
      pipSize = 1.0;
      pipValuePerStandardLot = 1;
    }

    const pipsAtRisk = priceDiff / pipSize;
    if (pipsAtRisk <= 0) return "0.01";

    const calculatedLot = riskAmount / (pipsAtRisk * pipValuePerStandardLot);
    return Math.max(0.01, Math.round(calculatedLot * 100) / 100).toFixed(2);
  };

  const handleCopySignal = () => {
    if (!signalData) return;
    const text = `🏛️ **شیکاری هەمەلایەنە و سیگناڵی دامەزراوەیی** 🏛️
━━━━━━━━━━━━━━━━━━━━
📌 **دراو / سامان**: ${signalData.trading_pair || "N/A"}
🎯 **بڕیاری کۆتایی**: ${signalData.final_decision || "N/A"}
⭐ **پلەی متمانە**: ${signalData.confidence_score || "N/A"} | **کوالیتی شیکاری**: ${signalData.trade_quality_score || "N/A"}
⚖️ **ڕێژەی مەترسی بە قازانج (R:R)**: ${signalData.risk_reward_ratio || "1:2+"}
━━━━━━━━━━━━━━━━━━━━
🚀 **خاڵی چوونەژوورەوە (Entry)**: ${signalData.entry || "N/A"}
🛑 **ڕاگرتنی زیان (Stop Loss)**: ${signalData.sl || "N/A"}
🟢 **ئامانجی یەکەم (TP1)**: ${signalData.tp1 || "N/A"}
🔵 **ئامانجی دووەم (TP2)**: ${signalData.tp2 || "N/A"}
🟣 **ئامانجی سێیەم (TP3)**: ${signalData.tp3 || "N/A"}
━━━━━━━━━━━━━━━━━━━━
📊 **پوختەی شیکاری پێش سیگناڵ**:
${signalData.detailed_pre_signal_audit || signalData.market_structure || "N/A"}
━━━━━━━━━━━━━━━━━━━━
💧 **نەختینە و SMC**: ${signalData.liquidity_areas || signalData.order_blocks || "N/A"}
⏱️ **جەلسە و کات**: ${signalData.session_context || signalData.validity_window || "N/A"}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const riskObj: RiskManagementDetails | null = typeof signalData?.risk_management === "object"
    ? (signalData.risk_management as RiskManagementDetails)
    : typeof signalData?.risk_warnings === "object"
    ? (signalData.risk_warnings as RiskManagementDetails)
    : null;

  return (
    <div id="result-report-container" className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* 2-Step Sequential Navigation Banner */}
      {isAdvanced && signalData && (
        <div className="bg-gradient-to-r from-gray-950 via-[#0d131f] to-gray-950 border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Pair & Workflow Breadcrumb */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {signalData.trading_pair || "FOREX / CRYPTO"}
                </span>
                {signalData.analyzed_by_ai && (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10">
                    ⚡ {signalData.analyzed_by_ai}
                  </span>
                )}
                {signalData.validity_window && (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {signalData.validity_window}
                  </span>
                )}
              </div>

              {/* Step Sequence Indicator */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ١. شیکاری وردی ۱۲ میتۆدەکە
                </span>
                <span className="text-gray-600">◀</span>
                <span className="flex items-center gap-1.5 font-bold text-sky-400">
                  <Target className="w-4 h-4 text-sky-400" />
                  ٢. دەرکردنی سیگناڵ بەپێی شیکارییەکە
                </span>
              </div>
            </div>

            {/* Workflow View Controls & Copy Button */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              <div className="bg-black/60 p-1 rounded-xl border border-white/10 flex items-center gap-1">
                <button
                  onClick={() => setWorkflowStage("both")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    workflowStage === "both" ? "bg-emerald-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  هەردوو قۆناغ بە یەکەوە
                </button>
                <button
                  onClick={() => setWorkflowStage("analysis_first")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    workflowStage === "analysis_first" ? "bg-emerald-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  ١. شیکاری وردی چارت
                </button>
                <button
                  onClick={() => setWorkflowStage("signal_only")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    workflowStage === "signal_only" ? "bg-emerald-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  ٢. سیگناڵ و ئامانجەکان
                </button>
              </div>

              <button
                onClick={handleCopySignal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>کۆپی کرا!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>کۆپیکردنی سیگناڵ و شیکاری</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1: COMPREHENSIVE 12-METHODOLOGY IN-DEPTH AUDIT */}
      {(workflowStage === "both" || workflowStage === "analysis_first") && (
        <section className="flex flex-col gap-6">
          {/* Phase 1 Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#0a1818] to-black border border-emerald-500/30 rounded-[28px] p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-black text-lg">
                ١
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  قۆناغی یەکەم: شیکاری هەمەلایەنە و تێروتەسەلی چارت (Institutional Audit)
                </h2>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  پشکنینی وردی چارت لە ڕوانگەی ١٢ میتۆدۆلۆجی سەرەکی بازاڕ پێش داڕشتنی سیگناڵ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>پشکنین بە سەرکەوتوویی تەواو بوو</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Chart Preview Image (5 Cols) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-4">
              <div className="bg-black/50 border border-white/10 rounded-[28px] p-5 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">وێنەی چارتی نێردراو</h3>
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {new Date(item.timestamp).toLocaleTimeString("ku-IQ")}
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/10 group bg-black/90 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt="Analyzed Chart"
                    className="w-full h-auto max-h-[520px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>
              </div>
            </div>

            {/* Deep Pre-Signal Technical Audit & 12 Methodologies (7 Cols) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-5">
              
              {/* Executive Pre-Signal Synthesis (The full technical story before signal) */}
              <div className="bg-gradient-to-br from-gray-950 via-[#0e1626] to-[#0a0f18] border border-sky-500/30 rounded-[28px] p-6 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-sky-400">
                    <FileText className="w-5 h-5" />
                    <h3 className="text-base font-bold text-white">
                      پوختەی شیکاری تێروتەسەلی چارت پێش دەرهێنانی سیگناڵ
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                    Technical Synthesis
                  </span>
                </div>

                <div className="text-sm text-gray-200 leading-relaxed font-normal whitespace-pre-line space-y-2">
                  {signalData?.detailed_pre_signal_audit ? (
                    <p>{signalData.detailed_pre_signal_audit}</p>
                  ) : (
                    <div className="space-y-1.5 text-xs text-gray-300">
                      <p className="flex items-center gap-1.5">
                        <strong className="text-emerald-400">ڕەوتی بازاڕ:</strong> {signalData?.current_trend || "ئاراستەی چالاکی بازاڕ دیاریکراوە."}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <strong className="text-amber-400">ناوچەی چوونەژوورەوە:</strong> {signalData?.order_blocks || signalData?.key_snr_zones || "زۆنی ئۆردەر بلۆک و ئاستی گونجاوی نرخ."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 12 Methodologies Tabs & Cards */}
              {isAdvanced && signalData ? (
                <div className="bg-black/50 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
                  
                  {/* Category Filter Tabs */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        وردەکارییەکانی ١٢ میتۆدۆلۆجی شیکاری (12 Methodologies)
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "all" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        هەمووی (12)
                      </button>
                      <button
                        onClick={() => setActiveTab("structure")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "structure" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        پێکهاتە و نرخ
                      </button>
                      <button
                        onClick={() => setActiveTab("smc_ict")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "smc_ict" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        SMC & ICT
                      </button>
                      <button
                        onClick={() => setActiveTab("indicators")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "indicators" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        مۆم و ئیندیپێندێنت
                      </button>
                      <button
                        onClick={() => setActiveTab("fundamentals")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "fundamentals" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        ماکرۆ و کات
                      </button>
                      <button
                        onClick={() => setActiveTab("risk")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "risk" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        مەترسی
                      </button>
                    </div>
                  </div>

                  {/* Grid of Methodology Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    
                    {/* 1. Market Structure */}
                    {(activeTab === "all" || activeTab === "structure") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" /> 1. پێکهاتەی بازاڕ (Market Structure)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">HH / HL / BOS</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.market_structure || signalData.current_trend || "پێکهاتەی بازاڕ بەپێی سوینگەکان دیاریکراوە."}
                        </p>
                      </div>
                    )}

                    {/* 2. Price Action Analysis */}
                    {(activeTab === "all" || activeTab === "structure") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4" /> 2. پرایس ئەکشن (Price Action)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Breakout & Retest</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.price_action || "شیکاری مۆمێنتۆم، شکاندن و ڕەتکردنەوەی نرخ (Rejection wicks)."}
                        </p>
                      </div>
                    )}

                    {/* 3. Support & Resistance */}
                    {(activeTab === "all" || activeTab === "structure") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Boxes className="w-4 h-4" /> 3. پاڵپشتی و بەرگری (Key SNR)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Major & Psych</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.support_levels && (
                            <p><strong className="text-emerald-400">پاڵپشتی:</strong> {signalData.support_levels}</p>
                          )}
                          {signalData.resistance_levels && (
                            <p><strong className="text-rose-400">بەرگری:</strong> {signalData.resistance_levels}</p>
                          )}
                          {signalData.key_snr_zones && (
                            <p><strong className="text-amber-400">ناوچەکان:</strong> {signalData.key_snr_zones}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 4. Supply & Demand Zones */}
                    {(activeTab === "all" || activeTab === "structure") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Flame className="w-4 h-4" /> 4. داواکاری و خستنەڕوو (Supply & Demand)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Fresh / Tested</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.supply_zone && (
                            <p><strong className="text-rose-400">خستنەڕوو (Supply):</strong> {signalData.supply_zone}</p>
                          )}
                          {signalData.demand_zone && (
                            <p><strong className="text-emerald-400">داواکاری (Demand):</strong> {signalData.demand_zone}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 5. Smart Money Concepts (SMC) */}
                    {(activeTab === "all" || activeTab === "smc_ict") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-4 h-4" /> 5. تێگەیشتنی SMC و نەختینە
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">BSL / SSL / OB</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-200 leading-relaxed font-medium">
                          {(signalData.liquidity_areas || signalData.liquidity_zones) && (
                            <p><strong className="text-purple-400">نەختینە:</strong> {signalData.liquidity_areas || signalData.liquidity_zones}</p>
                          )}
                          {signalData.order_blocks && (
                            <p><strong className="text-amber-400">ئۆردەر بلۆک:</strong> {signalData.order_blocks}</p>
                          )}
                          {signalData.fair_value_gaps && (
                            <p><strong className="text-indigo-400">کەوێن (FVG):</strong> {signalData.fair_value_gaps}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 6. ICT Concepts */}
                    {(activeTab === "all" || activeTab === "smc_ict") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Crosshair className="w-4 h-4" /> 6. شێوازی ICT (Inner Circle Trader)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">MSS / OTE 0.786</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.ict_concepts || "شیکاری گۆڕانی پێکهاتە (MSS)، چوونەژوورەوەی زێڕین (OTE 0.618-0.786) و جەلسەی بازاڕ."}
                        </p>
                      </div>
                    )}

                    {/* 7. Candlestick Patterns */}
                    {(activeTab === "all" || activeTab === "indicators") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                            <LineChart className="w-4 h-4" /> 7. شێوازی مۆمەکان (Candlesticks)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Pin / Engulfing</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.candlestick_patterns || "دۆزینەوەی مۆمی ڕەتکردنەوە، ئینگەڵفینگ، یان دۆجی لەسەر ئاستی بەهێز."}
                        </p>
                      </div>
                    )}

                    {/* 8. Technical Indicators & Volume */}
                    {(activeTab === "all" || activeTab === "indicators") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4" /> 8. ئیندیپێندێنت و ڤۆلیۆم (Indicators)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">RSI / MACD / EMAs</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.rsi_reading && (
                            <p><strong className="text-sky-400">RSI:</strong> {signalData.rsi_reading}</p>
                          )}
                          {signalData.macd_reading && (
                            <p><strong className="text-blue-400">MACD:</strong> {signalData.macd_reading}</p>
                          )}
                          {signalData.technical_indicators && (
                            <p><strong className="text-indigo-400">EMAs & Bands:</strong> {signalData.technical_indicators}</p>
                          )}
                          {signalData.volume_analysis && (
                            <p><strong className="text-emerald-400">ڤۆلیۆم:</strong> {signalData.volume_analysis}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 9. Fundamental Analysis */}
                    {(activeTab === "all" || activeTab === "fundamentals") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> 9. شیکاری بنەڕەتی (Fundamentals)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Interest / Macro</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.fundamental_impact || signalData.news_structure_impact || "لێکۆڵینەوەی ڕێژەی سوود، هەڵاوسان و کاریگەری کەتەلایستەکان."}
                        </p>
                      </div>
                    )}

                    {/* 10. Session Analysis */}
                    {(activeTab === "all" || activeTab === "fundamentals") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> 10. جەلسەی بازاڕ (Session Analysis)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Asia / London / NY</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.session_context || "لێکۆڵینەوەی کاتی جەلسەی لەندەن و نیویۆرک لەگەڵ کاتەکانی تەقینەوەی نەختینە."}
                        </p>
                      </div>
                    )}

                    {/* 11. Multi-Timeframe Analysis */}
                    {(activeTab === "all" || activeTab === "structure") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-4 h-4" /> 11. شیکاری فرە-فریم (Multi-Timeframe)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">HTF vs LTF</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {signalData.multi_timeframe_analysis || "هاوتەریبکردنی ئاراستەی فریمی باڵا (Daily/H4) لەگەڵ خاڵی چوونەژوورەوەی فریمی بچووک (M5/M15)."}
                        </p>
                      </div>
                    )}

                    {/* 12. Risk Management Rules */}
                    {(activeTab === "all" || activeTab === "risk") && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> 12. بەڕێوەبردنی مەترسی (Risk Management)
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">Max 1% Risk</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-200 leading-relaxed font-medium">
                          {riskObj?.max_risk_per_trade && (
                            <p><strong className="text-amber-400">زۆرترین ڕیسک:</strong> {riskObj.max_risk_per_trade}</p>
                          )}
                          {riskObj?.stop_loss_placement && (
                            <p><strong className="text-rose-400">دانانی ستۆپ:</strong> {riskObj.stop_loss_placement}</p>
                          )}
                          {riskObj?.execution_tip && (
                            <p><strong className="text-emerald-400">ئامۆژگاری جێبەجێکردن:</strong> {riskObj.execution_tip}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* PHASE 2: CONFLUENCE-DERIVED ACTIONABLE TRADE SIGNAL */}
      {(workflowStage === "both" || workflowStage === "signal_only") && (
        <section className="flex flex-col gap-6 pt-2">
          
          {/* Phase 2 Header Banner */}
          <div className="bg-gradient-to-r from-blue-950/40 via-[#0d1624] to-black border border-blue-500/30 rounded-[28px] p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-black text-lg">
                ٢
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  قۆناغی دووەم: سیگناڵی کۆتایی و پلانی جێبەجێکردنی مامەڵە (Trade Signal & Plan)
                </h2>
                <p className="text-xs text-blue-300/80 mt-0.5">
                  دەرهێنراوە لەسەر بنەمای کۆنفڵوێنس و ئەنجامی تەواوبوونی شیکارییەکانی قۆناغی یەکەم
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">کۆنفڵوێنس:</span>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {signalData?.confidence_score || "High"}
              </span>
            </div>
          </div>

          {/* Decision Hero Banner */}
          {isAdvanced && signalData && (
            <div className="bg-gradient-to-br from-gray-950 via-[#0d131f] to-gray-950 border border-white/10 rounded-[32px] p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-center ${
                    isStrongBuy || isBuy ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                    isStrongSell || isSell ? "bg-rose-500/15 border-rose-500/30 text-rose-400" :
                    "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  }`}>
                    {isStrongBuy || isBuy ? <TrendingUp className="w-8 h-8" /> :
                     isStrongSell || isSell ? <TrendingDown className="w-8 h-8" /> :
                     <Compass className="w-8 h-8" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-gray-400">
                        بڕیاری پەسەندکراو لەسەر بنەمای کۆنفڵوێنس:
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <h2 className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                        isStrongBuy ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" :
                        isBuy ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
                        isStrongSell ? "text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]" :
                        isSell ? "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]" :
                        "text-amber-400"
                      }`}>
                        {decisionType}
                      </h2>
                      {(isStrongBuy || isStrongSell) && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
                          بەرزی متمانە
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
                  {signalData.confidence_score && (
                    <div className="bg-black/50 border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">متمانە (Confidence)</p>
                      <p className="text-base font-mono font-black text-emerald-400">{signalData.confidence_score}</p>
                    </div>
                  )}

                  {signalData.trade_quality_score && (
                    <div className="bg-black/50 border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">کوالیتی (Quality)</p>
                      <p className="text-base font-mono font-black text-blue-400 flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        {signalData.trade_quality_score}
                      </p>
                    </div>
                  )}

                  {signalData.risk_reward_ratio && (
                    <div className="bg-black/50 border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">ڕێژەی R:R</p>
                      <p className="text-base font-mono font-black text-amber-400">{signalData.risk_reward_ratio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Signal Targets & Risk Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Entry, Stop Loss & Take Profit Tiers (7 Cols) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-5">
              <div className="bg-black/50 border border-white/10 rounded-[32px] p-6 sm:p-7 shadow-2xl space-y-6">
                
                {/* Entry & Stop Loss Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-emerald-400" />
                      ئاستەکانی چوونەژوورەوە و ڕاگرتنی زیان
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                        خاڵی چوونەژوورەوە (Entry Point / Zone)
                      </p>
                      <p className="text-xl sm:text-2xl font-mono font-black text-white">{signalData?.entry || "Pending Zone"}</p>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl">
                      <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">
                        ڕاگرتنی زیان (Stop Loss / Invalidation)
                      </p>
                      <p className="text-xl sm:text-2xl font-mono font-black text-rose-400">{signalData?.sl || "Structural SL"}</p>
                    </div>
                  </div>
                </div>

                {/* Take Profit Target Tiers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    ئامانجەکانی قازانج (Take Profit Targets)
                  </h3>

                  <div className="space-y-2.5">
                    {/* TP1 */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-emerald-400 uppercase font-bold">ئامانجی یەکەم (Take Profit 1 - Conservative)</p>
                        <p className="text-lg sm:text-xl font-mono font-bold text-white">{signalData?.tp1 || "N/A"}</p>
                      </div>
                      {getPipText(signalData?.tp1) && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-mono font-bold border border-emerald-500/30">
                          {getPipText(signalData?.tp1)}
                        </span>
                      )}
                    </div>

                    {/* TP2 */}
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-blue-400 uppercase font-bold">ئامانجی دووەم (Take Profit 2 - Major Target)</p>
                        <p className="text-lg sm:text-xl font-mono font-bold text-white">{signalData?.tp2 || "N/A"}</p>
                      </div>
                      {getPipText(signalData?.tp2) && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-mono font-bold border border-blue-500/30">
                          {getPipText(signalData?.tp2)}
                        </span>
                      )}
                    </div>

                    {/* TP3 */}
                    {signalData?.tp3 && (
                      <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-purple-400 uppercase font-bold">ئامانجی سێیەم (Take Profit 3 - Runner Target)</p>
                          <p className="text-lg sm:text-xl font-mono font-bold text-white">{signalData.tp3}</p>
                        </div>
                        {getPipText(signalData.tp3) && (
                          <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full font-mono font-bold border border-purple-500/30">
                            {getPipText(signalData.tp3)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Lot Calculator & Risk Directives (5 Cols) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-5">
              
              {/* Lot Sizing Calculator */}
              <div className="bg-black/50 border border-white/10 p-6 rounded-[28px] space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      حاسیبەی لۆت و بەڕێوەبردنی سەرمایە
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-lg border border-emerald-500/30">
                    {calculateRecommendedLot()} Lot
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-medium">باڵانسی هەژمار ($)</label>
                    <input
                      type="number"
                      value={balance}
                      onChange={(e) => setBalance(Number(e.target.value) || 100)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-medium">ڕێژەی مەترسی (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(Number(e.target.value) || 1)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Risk Management & Alerts */}
              <div className="bg-amber-500/10 border border-amber-500/25 p-6 rounded-[28px] space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400 border-b border-amber-500/20 pb-2.5">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    ڕێنمایی و پارێزگارییەکانی مەترسی
                  </span>
                </div>

                <div className="space-y-2 text-xs text-amber-200/90 leading-relaxed">
                  {riskObj ? (
                    <>
                      {riskObj.stop_loss_placement && (
                        <p className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span><strong>لۆژیکی ستۆپ:</strong> {riskObj.stop_loss_placement}</span>
                        </p>
                      )}
                      {riskObj.slippage_risk && (
                        <p className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span><strong>خلیسکانی نرخ (Slippage):</strong> {riskObj.slippage_risk}</span>
                        </p>
                      )}
                      {riskObj.fakeout_alert && (
                        <p className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span><strong>جووڵەی ساختە (Fakeout):</strong> {riskObj.fakeout_alert}</span>
                        </p>
                      )}
                      {riskObj.execution_tip && (
                        <p className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span><strong>جێبەجێکردن:</strong> {riskObj.execution_tip}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      پەیڕەوی یاسای ڕیسکی نەگۆڕ بکە (زۆرترین ٠.٥٪ بۆ ١.٠٪ لە هەر مامەڵەیەکدا) و هەمیشە چاوەڕێی داخرانی مۆمی پشتڕاستکردنەوە بکە.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fallback Markdown if raw text */}
      {!isAdvanced && item.report && (
        <div className="bg-black/50 border border-white/10 rounded-[32px] p-6 shadow-2xl">
          <div className="markdown-body prose prose-invert prose-emerald max-w-none text-gray-300">
            <Markdown>{item.report}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
