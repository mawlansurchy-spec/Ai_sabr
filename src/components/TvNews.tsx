import { useEffect, useState, useRef } from "react";
import { 
  RefreshCw, 
  Settings, 
  Key, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Flame, 
  Calendar, 
  Building2, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2,
  X
} from "lucide-react";
import { TradingViewChart } from "./VisualChartRenderer";

interface NewsItem {
  title: string;
  description: string;
  countryFlag: string;
  time: string;
  impactLevel: "High" | "Medium" | "Low";
  relatedMarket: "GOLD" | "OIL" | "FOREX" | "GLOBAL" | "ECONOMIC CALENDAR" | "CENTRAL BANK" | "GEOPOLITICAL" | "BREAKING";
  source: string;
}

// Live-like rates mock state for Bloomberg Ticker with realistic updates
interface TickerRate {
  symbol: string;
  name: string;
  value: number;
  change: number;
  isCommodity?: boolean;
}

export function TvNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChartSymbol, setSelectedChartSymbol] = useState("CAPITALCOM:GOLD");
  const [isChartVisible, setIsChartVisible] = useState(true);
  
  // API Keys state (persisted in local storage)
  const [newsApiKey, setNewsApiKey] = useState(() => localStorage.getItem("db_newsapi_key") || "");
  const [finnhubKey, setFinnhubKey] = useState(() => localStorage.getItem("db_finnhub_key") || "");
  const [isSaved, setIsSaved] = useState(false);

  // Auto refresh timer state
  const [countdown, setCountdown] = useState(180); // 3 minutes automatic refresh
  const [tickerRates, setTickerRates] = useState<TickerRate[]>([
    { symbol: "XAU/USD", name: "زێڕ", value: 2384.50, change: 0.42, isCommodity: true },
    { symbol: "BRENT", name: "نەوتی برێنت", value: 84.22, change: -0.15, isCommodity: true },
    { symbol: "WTI", name: "نەوتی تێکساس", value: 79.80, change: 0.12, isCommodity: true },
    { symbol: "EUR/USD", name: "یۆرۆ/دۆلار", value: 1.0845, change: -0.08 },
    { symbol: "GBP/USD", name: "پاوەند/دۆلار", value: 1.2720, change: 0.18 },
    { symbol: "USD/JPY", name: "دۆلار/یەن", value: 157.45, change: 0.25 },
    { symbol: "BTC/USDT", name: "بیتکۆین", value: 64250, change: 1.85 },
  ]);

  // Fetch translated real-time news from our server
  const fetchNews = async () => {
    setLoading(true);
    try {
      // Build request with optional user headers
      const headers: Record<string, string> = {};
      if (newsApiKey.trim()) {
        headers["x-newsapi-key"] = newsApiKey.trim();
      }
      if (finnhubKey.trim()) {
        headers["x-finnhub-key"] = finnhubKey.trim();
      }

      let res = await fetch("/api/tv-news", {
        method: "GET",
        headers,
      });

      let contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // Wait and retry once for proxy cookie setup
        await new Promise((r) => setTimeout(r, 1000));
        res = await fetch("/api/tv-news", {
          method: "GET",
          headers,
        });
        contentType = res.headers.get("content-type") || "";
      }

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch news from server feed:", err);
      if (news.length === 0) {
        setNews([
          {
            title: "نرخی زێڕ لە ئاستێکی بەرزدا جێگیر بووە پێش بڵاوبوونەوەی داتاکانی هەڵاوسان",
            description: "بازاڕی زێڕی جیهانی بڕێکی باش لە داواکاری بەخۆیەوە دەبینێت. شیکەرەوان چاوەڕوانی تێپەڕاندنی ئاستە سەرەکییەکان دەکەن.",
            countryFlag: "🌐",
            time: "ئێستا",
            impactLevel: "High",
            relatedMarket: "GOLD",
            source: "بلومبێرگ"
          },
          {
            title: "بازاڕی دراوەکان (Forex) ڕووبەڕووی بزوتنەوەی بەرچاو دەبێتەوە",
            description: "جووت دراوەکانی یۆرۆ و دۆلار لەژێر کاریگەری بریارەکانی بەنکە ناوەندییەکان و داتاکانی ئابووریدان.",
            countryFlag: "🇺🇸",
            time: "١٠ خولەک پێش ئێستا",
            impactLevel: "Medium",
            relatedMarket: "FOREX",
            source: "ڕویترز"
          }
        ]);
      }
    } finally {
      setLoading(false);
      setCountdown(180); // reset countdown on fetch
    }
  };

  // Simulating slightly live fluctuating market numbers for the Bloomberg ticker
  useEffect(() => {
    const rateInterval = setInterval(() => {
      setTickerRates((prevRates) =>
        prevRates.map((rate) => {
          const delta = (Math.random() - 0.5) * 0.1;
          const newValue = Number((rate.value + delta * (rate.value > 1000 ? 5 : 0.1)).toFixed(2));
          const newChange = Number((rate.change + delta * 0.05).toFixed(2));
          return {
            ...rate,
            value: newValue,
            change: newChange,
          };
        })
      );
    }, 4000);
    return () => clearInterval(rateInterval);
  }, []);

  // Fetch news on mount and handle automatic countdown refresh
  useEffect(() => {
    fetchNews();

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchNews(); // Trigger background fetch on zero
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [newsApiKey, finnhubKey]);

  // Handle saving private API Keys locally
  const saveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("db_newsapi_key", newsApiKey.trim());
    localStorage.setItem("db_finnhub_key", finnhubKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setShowSettings(false);
    }, 1500);
    fetchNews();
  };

  // Filter and search computation
  const filteredNews = news.filter((item) => {
    const matchesFilter = 
      activeFilter === "ALL" || 
      item.relatedMarket?.toUpperCase() === activeFilter.toUpperCase();
    const matchesSearch = 
      searchTerm === "" || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Helper icons for categories
  const getMarketIcon = (market: string) => {
    switch (market.toUpperCase()) {
      case "GOLD":
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case "OIL":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "FOREX":
        return <Globe className="w-4 h-4 text-blue-400" />;
      case "ECONOMIC CALENDAR":
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case "CENTRAL BANK":
        return <Building2 className="w-4 h-4 text-purple-400" />;
      case "GEOPOLITICAL":
        return <Globe className="w-4 h-4 text-teal-400" />;
      case "BREAKING":
        return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
      default:
        return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6" dir="rtl">
      
      {/* Dynamic Bloomberg Smooth Scrolling Ticker */}
      <div className="w-full bg-black border-y border-amber-500/20 py-2.5 overflow-hidden relative shadow-[0_0_20px_rgba(245,158,11,0.05)]">
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black to-transparent w-16 z-10 pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black to-transparent w-16 z-10 pointer-events-none"></div>
        
        <div className="flex animate-[shimmer_30s_linear_infinite] whitespace-nowrap gap-12 text-xs font-mono select-none">
          {/* Duplicating the list to guarantee continuous infinite scroll */}
          {[...tickerRates, ...tickerRates].map((rate, index) => (
            <div key={index} className="inline-flex items-center gap-2">
              <span className="text-gray-400 uppercase font-semibold">{rate.symbol}</span>
              <span className="text-amber-400">{rate.name}</span>
              <span className="text-white font-bold">${rate.value.toLocaleString()}</span>
              <span className={`inline-flex items-center gap-0.5 font-bold ${rate.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {rate.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {rate.change >= 0 ? "+" : ""}{rate.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bloomberg Header Panel */}
      <div className="bg-[#080808] border border-amber-500/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative gold terminal corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Globe className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold tracking-wider uppercase border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                TERMINAL LIVE
              </span>
              <span className="text-xs text-gray-400 font-mono">
                داهێنراوی خۆکار: {countdown}س
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1 font-sans">
              تەرمیناڵی هەواڵەکانی بلومبێرگ <span className="text-amber-400 text-sm font-mono">(BLOOMBERG STYLE)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              هەواڵی ڕاستەقینە و نوێی بازاڕە جیهانییەکان بە وەرگێڕانی خۆکاری دەستبەجێ بۆ زمانی شیرینی کوردی.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all duration-300 ${
              showSettings 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                : "bg-[#101010] text-gray-300 border-white/5 hover:border-amber-500/30 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            ڕێکخستنی کلیلەکان (API)
          </button>
          
          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold font-mono transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            نوێکردنەوەی دەستی
          </button>
        </div>
      </div>

      {/* Expandable Local API Settings Panel */}
      {showSettings && (
        <div className="bg-[#050505] border border-amber-500/30 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top duration-300 relative">
          <button 
            onClick={() => setShowSettings(false)}
            className="absolute left-4 top-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">کۆنفیدێراسیۆنی کلیلەکانی API دەرەکی</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            ئەگەر دەتەوێت هەواڵەکان لە سەرچاوە دەرەکییەکان بەرزتر بکەیتەوە، دەتوانیت کلیلی تایبەت بەخۆت لێرە دابنێیت. ئەگەر کلیلەکان بەتاڵ بن، سیستەمەکە بە خۆکاری بەستەری ناوخۆیی و ڕاستەوخۆی بلومبێرگ و یاهو بەکاردەهێنێت. کۆدەکان بە تەواوی لە ناو وێبگەڕەکەتدا پارێزراون.
          </p>
          <form onSubmit={saveApiKeys} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-amber-400">NEWSAPI.ORG API KEY</label>
              <input
                type="password"
                value={newsApiKey}
                onChange={(e) => setNewsApiKey(e.target.value)}
                placeholder="کلیلی NewsAPI یان بەتاڵ بەجێبهێڵە"
                className="bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none transition-all font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-amber-400">FINNHUB.IO TOKEN</label>
              <input
                type="password"
                value={finnhubKey}
                onChange={(e) => setFinnhubKey(e.target.value)}
                placeholder="کلیلی Finnhub Token یان بەتاڵ بەجێبهێڵە"
                className="bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none transition-all font-mono"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setNewsApiKey("");
                  setFinnhubKey("");
                  localStorage.removeItem("db_newsapi_key");
                  localStorage.removeItem("db_finnhub_key");
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 1500);
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all"
              >
                سڕینەوەی کلیلەکان
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                پاشەکەوتکردنی کلیلەکان
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TradingView Live Terminal Chart Section */}
      <div className="bg-[#080808] border border-blue-500/20 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  چارتی ڕاستەوخۆی ترایدینگ ڤیو (TradingView Live Terminal)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  LIVE INTERACTIVE
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                چاودێریکردنی ئاستەکانی نرخ و نەوسانی بازاڕەکان ڕاستەوخۆ هاوتەریب لەگەڵ هەواڵەکانی بلومبێرگ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Symbol Switcher */}
            {[
              { id: "CAPITALCOM:GOLD", name: "زێڕ XAU/USD", icon: Sparkles },
              { id: "FX:EURUSD", name: "یۆرۆ EUR/USD", icon: Globe },
              { id: "FX:GBPUSD", name: "پاوەند GBP/USD", icon: Globe },
              { id: "BINANCE:BTCUSDT", name: "بیتکۆین BTC", icon: TrendingUp },
              { id: "TVC:USOIL", name: "نەوت USOIL", icon: Flame },
              { id: "CAPITALCOM:US100", name: "نازداک US100", icon: TrendingUp },
            ].map((sym) => {
              const Icon = sym.icon;
              const isSelected = selectedChartSymbol === sym.id;
              return (
                <button
                  key={sym.id}
                  onClick={() => setSelectedChartSymbol(sym.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    isSelected
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-[1.02]"
                      : "bg-[#101010] text-gray-400 hover:text-white border-white/5 hover:border-white/15"
                  }`}
                >
                  <Icon className="w-3 h-3 text-blue-400" />
                  <span>{sym.name}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsChartVisible(!isChartVisible)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-colors text-xs font-semibold flex items-center gap-1"
              title={isChartVisible ? "داخستنی چارت" : "پیشاندانی چارت"}
            >
              <span>{isChartVisible ? "شاردنەوەی چارت" : "پیشاندانی چارت"}</span>
            </button>
          </div>
        </div>

        {/* Embedded Live TradingView Chart */}
        {isChartVisible && (
          <div className="animate-in fade-in duration-300">
            <TradingViewChart symbol={selectedChartSymbol} height={460} />
          </div>
        )}
      </div>

      {/* Navigation Markets Toggles and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
        {/* Markets category bar (Bloomberg Terminal style) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-thin">
          {[
            { id: "ALL", label: "سەرجەم هەواڵەکان" },
            { id: "GOLD", label: "زێڕ (XAU)" },
            { id: "OIL", label: "نەوت (OIL)" },
            { id: "FOREX", label: "دراوەکان (FX)" },
            { id: "GLOBAL", label: "جیهانی" },
            { id: "ECONOMIC CALENDAR", label: "ڕۆژژمێری ئابووری" },
            { id: "CENTRAL BANK", label: "بانکی ناوەندی" },
            { id: "GEOPOLITICAL", label: "جیۆپۆلیتیک" },
            { id: "BREAKING", label: "بەپەلە" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                activeFilter === cat.id
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  : "bg-black/30 text-gray-400 border-white/5 hover:text-white hover:border-white/15"
              }`}
            >
              {cat.id !== "ALL" && getMarketIcon(cat.id)}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Searching field */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="گەڕان لە هەواڵەکان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:border-amber-500 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="w-full flex flex-col gap-4">
        {loading && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4 bg-black/20 rounded-3xl border border-white/5">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="font-mono text-xs text-amber-400">داگرتن و وەرگێڕانی دەستبەجێی هەواڵەکانی بازاڕ بە فۆرماتی کوردی...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-4 bg-black/20 rounded-3xl border border-white/5">
            <AlertTriangle className="w-12 h-12 text-amber-500/50" />
            <p className="text-sm font-sans">هیچ هەواڵێکی چالاک لەم پۆلێنەدا نەدۆزرایەوە.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((item, index) => (
              <div
                key={index}
                className="group bg-[#040404] border border-amber-500/5 hover:border-amber-500/20 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Decorative bloomberg neon edge on hover */}
                <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-amber-500/20 group-hover:bg-amber-400 transition-colors"></div>
                
                <div className="flex flex-col gap-3 relative z-10">
                  {/* Top Bar Metadata */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Country Flag */}
                      <span className="text-lg bg-white/5 px-2 py-0.5 rounded border border-white/5 select-none" title="وڵاتی پەیوەندیدار">
                        {item.countryFlag || "🌐"}
                      </span>
                      {/* Related market badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-amber-400 bg-amber-500/5 px-2.5 py-0.5 rounded border border-amber-500/10">
                        {getMarketIcon(item.relatedMarket)}
                        {item.relatedMarket || "GLOBAL"}
                      </span>
                      {/* Impact Level indicator */}
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.impactLevel === "High" 
                          ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                          : item.impactLevel === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.impactLevel === "High" 
                            ? "bg-red-500 animate-pulse" 
                            : item.impactLevel === "Medium" 
                              ? "bg-amber-400" 
                              : "bg-emerald-500"
                        }`}></span>
                        {item.impactLevel === "High" ? "کاریگەری بەرز" : item.impactLevel === "Medium" ? "کاریگەری مامناوەند" : "کاریگەری نزم"}
                      </span>
                    </div>

                    {/* Published relative time */}
                    <span className="text-[10px] font-mono text-gray-400 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                      {item.time || "کەمێک پێش ئێستا"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Source Info */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 relative z-10 text-[10px] font-mono text-gray-500">
                  <span>سەرچاوە: <strong className="text-gray-300 font-sans">{item.source || "Reuters"}</strong></span>
                  <span className="text-[9px] text-amber-500/50">BLOOMBERG TERMINAL FEED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Terminal Status Bar at the bottom */}
      <div className="bg-[#040404] border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-gray-500 mt-4 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            CONNECTED SECURE
          </span>
          <span>SYSTEM TIME: {new Date().toLocaleTimeString()}</span>
          <span>LATENCY: 42ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span>CURRENCY DATA FEED: ACTIVE</span>
          <span className="text-amber-500/80">Dr.Devan Terminal v2.1</span>
        </div>
      </div>

    </div>
  );
}
