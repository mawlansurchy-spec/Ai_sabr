import { GoogleGenAI } from "@google/genai";

export interface LiveMarketData {
  symbol: string;
  tradingViewSymbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  changePercent: number;
  rsi: number;
  ema20: number;
  ema50: number;
  macd: number;
  macdSignal: number;
  recommendation: number; // -1 to 1
  category: string;
  candles: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

// Maps user-friendly pair names to TradingView scanner symbols & Binance klines
export function resolveMarketSymbol(input: string): {
  cleanName: string;
  scannerCategory: "cfd" | "forex" | "crypto" | "futures" | "america";
  tvTicker: string;
  binanceSymbol?: string;
  decimals: number;
} {
  const norm = (input || "").toUpperCase().trim();

  if (norm.includes("XAU") || norm.includes("GOLD") || norm.includes("زێڕ")) {
    return {
      cleanName: "XAU/USD (Gold)",
      scannerCategory: "cfd",
      tvTicker: "TVC:GOLD",
      binanceSymbol: "PAXGUSDT",
      decimals: 2,
    };
  }

  if (norm.includes("EUR")) {
    return {
      cleanName: "EUR/USD",
      scannerCategory: "forex",
      tvTicker: "FX:EURUSD",
      binanceSymbol: "EURUSDT",
      decimals: 5,
    };
  }

  if (norm.includes("GBP")) {
    return {
      cleanName: "GBP/USD",
      scannerCategory: "forex",
      tvTicker: "FX:GBPUSD",
      binanceSymbol: "GBPUSDT",
      decimals: 5,
    };
  }

  if (norm.includes("JPY")) {
    return {
      cleanName: "USD/JPY",
      scannerCategory: "forex",
      tvTicker: "FX:USDJPY",
      decimals: 3,
    };
  }

  if (norm.includes("BTC") || norm.includes("BITCOIN")) {
    return {
      cleanName: "BTC/USDT",
      scannerCategory: "crypto",
      tvTicker: "BINANCE:BTCUSDT",
      binanceSymbol: "BTCUSDT",
      decimals: 2,
    };
  }

  if (norm.includes("ETH")) {
    return {
      cleanName: "ETH/USDT",
      scannerCategory: "crypto",
      tvTicker: "BINANCE:ETHUSDT",
      binanceSymbol: "ETHUSDT",
      decimals: 2,
    };
  }

  if (norm.includes("OIL") || norm.includes("WTI") || norm.includes("BRENT") || norm.includes("نەوت")) {
    return {
      cleanName: "WTI Crude Oil",
      scannerCategory: "futures",
      tvTicker: "NYMEX:CL1!",
      decimals: 2,
    };
  }

  if (norm.includes("US100") || norm.includes("NAS") || norm.includes("NDX") || norm.includes("نازداک")) {
    return {
      cleanName: "US100 (Nasdaq)",
      scannerCategory: "america",
      tvTicker: "NASDAQ:NDX",
      decimals: 2,
    };
  }

  if (norm.includes("US30") || norm.includes("DOW") || norm.includes("DJI")) {
    return {
      cleanName: "US30 (Dow Jones)",
      scannerCategory: "america",
      tvTicker: "FOREXCOM:DJ30",
      decimals: 2,
    };
  }

  if (norm.includes("SPX") || norm.includes("S&P") || norm.includes("500")) {
    return {
      cleanName: "SPX500 (S&P 500)",
      scannerCategory: "america",
      tvTicker: "FOREXCOM:SPX500",
      decimals: 2,
    };
  }

  if (norm.includes("SOL")) {
    return {
      cleanName: "SOL/USDT",
      scannerCategory: "crypto",
      tvTicker: "BINANCE:SOLUSDT",
      binanceSymbol: "SOLUSDT",
      decimals: 2,
    };
  }

  if (norm.includes("XAG") || norm.includes("SILVER") || norm.includes("زیو")) {
    return {
      cleanName: "XAG/USD (Silver)",
      scannerCategory: "cfd",
      tvTicker: "TVC:SILVER",
      decimals: 3,
    };
  }

  // Default fallback to Gold
  return {
    cleanName: norm || "XAU/USD (Gold)",
    scannerCategory: "cfd",
    tvTicker: "TVC:GOLD",
    binanceSymbol: "PAXGUSDT",
    decimals: 2,
  };
}

// Fetch live technical analysis and quotes directly from TradingView Scanner
export async function fetchTradingViewLiveScan(
  category: string,
  ticker: string
): Promise<{
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  rsi: number;
  ema20: number;
  ema50: number;
  macd: number;
  macdSignal: number;
  recommendation: number;
} | null> {
  try {
    const url = `https://scanner.tradingview.com/${category}/scan`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (TradingView Client)",
      },
      body: JSON.stringify({
        symbols: { tickers: [ticker] },
        columns: [
          "Recommend.All",
          "RSI",
          "open",
          "high",
          "low",
          "close",
          "change",
          "EMA20",
          "EMA50",
          "MACD.macd",
          "MACD.signal",
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const json: any = await res.json();
    const row = json?.data?.[0]?.d;
    if (!row || !Array.isArray(row)) return null;

    const [
      recommendation,
      rsi,
      open,
      high,
      low,
      close,
      change,
      ema20,
      ema50,
      macd,
      macdSignal,
    ] = row;

    return {
      price: Number(close || open || 0),
      open: Number(open || 0),
      high: Number(high || 0),
      low: Number(low || 0),
      close: Number(close || 0),
      change: Number(change || 0),
      rsi: Number(rsi || 50),
      ema20: Number(ema20 || close || 0),
      ema50: Number(ema50 || close || 0),
      macd: Number(macd || 0),
      macdSignal: Number(macdSignal || 0),
      recommendation: Number(recommendation || 0),
    };
  } catch (e) {
    console.error(`TradingView scan failed for ${ticker}:`, e);
    return null;
  }
}

// Fetch real candlestick history (OHLCV) from Binance
export async function fetchBinanceKlines(
  binanceSymbol: string,
  interval = "15m",
  limit = 35
): Promise<
  {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[]
> {
  try {
    // Map timeframes to binance intervals
    let bnInterval = "15m";
    if (interval.includes("1") && interval.toLowerCase().includes("m") && !interval.toLowerCase().includes("15")) bnInterval = "1m";
    else if (interval.includes("5") && interval.toLowerCase().includes("m")) bnInterval = "5m";
    else if (interval.includes("15")) bnInterval = "15m";
    else if (interval.includes("60") || interval.toUpperCase().includes("H1")) bnInterval = "1h";
    else if (interval.includes("240") || interval.toUpperCase().includes("H4")) bnInterval = "4h";
    else if (interval.toUpperCase().includes("D")) bnInterval = "1d";

    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${bnInterval}&limit=${limit}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "TradingEngine/1.0" },
    });
    if (!res.ok) return [];

    const rawKlines: any = await res.json();
    if (!Array.isArray(rawKlines)) return [];

    return rawKlines.map((k: any) => ({
      time: Number(k[0]),
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }));
  } catch (e) {
    console.error("Failed to fetch Binance klines:", e);
    return [];
  }
}

// Generates an SVG / PNG data URL with real candlestick geometry, real price labels, and technical levels
export function renderRealMarketChartSvg(
  market: LiveMarketData,
  timeframe: string
): string {
  const width = 1280;
  const height = 720;
  const paddingLeft = 70;
  const paddingRight = 100;
  const paddingTop = 100;
  const paddingBottom = 70;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const candles = market.candles && market.candles.length > 0 ? market.candles : [];

  let minPrice = market.low * 0.998;
  let maxPrice = market.high * 1.002;

  if (candles.length > 0) {
    minPrice = Math.min(...candles.map((c) => c.low));
    maxPrice = Math.max(...candles.map((c) => c.high));
    const range = maxPrice - minPrice;
    minPrice -= range * 0.08;
    maxPrice += range * 0.08;
  }

  const priceRange = maxPrice - minPrice || 1;
  const scaleY = (p: number) => paddingTop + chartHeight - ((p - minPrice) / priceRange) * chartHeight;

  // Candle step
  const count = candles.length || 30;
  const step = chartWidth / count;

  let candlesSvg = "";
  candles.forEach((c, i) => {
    const isBull = c.close >= c.open;
    const x = paddingLeft + i * step + step * 0.15;
    const w = step * 0.7;

    const yHigh = scaleY(c.high);
    const yLow = scaleY(c.low);
    const yOpen = scaleY(c.open);
    const yClose = scaleY(c.close);

    const bodyY = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);
    const color = isBull ? "#10b981" : "#ef4444";

    candlesSvg += `
      <line x1="${x + w / 2}" y1="${yHigh}" x2="${x + w / 2}" y2="${yLow}" stroke="${color}" stroke-width="1.5" />
      <rect x="${x}" y="${bodyY}" width="${w}" height="${bodyHeight}" fill="${color}" rx="1" />
    `;
  });

  // Price scale grid lines and labels
  const gridSteps = 6;
  let gridSvg = "";
  for (let i = 0; i <= gridSteps; i++) {
    const p = minPrice + (priceRange / gridSteps) * i;
    const y = scaleY(p);
    gridSvg += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      <text x="${width - paddingRight + 10}" y="${y + 4}" fill="#94a3b8" font-size="12" font-family="monospace">${p.toFixed(market.price > 100 ? 2 : 4)}</text>
    `;
  }

  // Current Price Line
  const curY = scaleY(market.price);
  const curColor = market.changePercent >= 0 ? "#10b981" : "#ef4444";

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b0f17" />
      <stop offset="100%" stop-color="#070a0f" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)" />

  <!-- Watermark Grid -->
  ${gridSvg}

  <!-- Header Info -->
  <text x="${paddingLeft}" y="50" fill="#ffffff" font-size="24" font-weight="bold" font-family="system-ui, sans-serif">
    ${market.symbol} • ${timeframe} • TradingView Live Real-Time Feed
  </text>
  <text x="${paddingLeft}" y="80" fill="${curColor}" font-size="16" font-family="monospace" font-weight="bold">
    LIVE PRICE: ${market.price.toFixed(market.price > 100 ? 2 : 4)} (${market.changePercent >= 0 ? "+" : ""}${market.changePercent.toFixed(2)}%) | RSI: ${market.rsi.toFixed(1)} | EMA20: ${market.ema20.toFixed(2)} | EMA50: ${market.ema50.toFixed(2)}
  </text>

  <!-- Candlesticks -->
  ${candlesSvg}

  <!-- Current Live Price Tracking Line -->
  <line x1="${paddingLeft}" y1="${curY}" x2="${width - paddingRight}" y2="${curY}" stroke="${curColor}" stroke-dasharray="4 4" stroke-width="1.5" />
  <rect x="${width - paddingRight + 5}" y="${curY - 12}" width="90" height="24" rx="4" fill="${curColor}" />
  <text x="${width - paddingRight + 12}" y="${curY + 4}" fill="#000000" font-weight="bold" font-size="12" font-family="monospace">
    ${market.price.toFixed(market.price > 100 ? 2 : 4)}
  </text>

  <!-- Footer Watermark -->
  <text x="${width - paddingRight}" y="${height - 25}" fill="#64748b" font-size="12" font-family="sans-serif" text-anchor="end">
    TradingView Verified Institutional Feed • Dr.Devan AI
  </text>
</svg>
  `.trim();

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
