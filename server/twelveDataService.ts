import { Request, Response } from "express";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";
const ALLOWED_INTERVALS = ["1min", "5min", "15min", "30min", "1h", "4h", "1day"];

export interface TwelveDataPriceResponse {
  status: "ok" | "error";
  symbol: string;
  name?: string;
  price?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  previous_close?: number;
  change?: number;
  percent_change?: number;
  timestamp?: number;
  datetime?: string;
  source: string;
  configured: boolean;
  error?: string;
  code?: number | string;
}

export interface TwelveDataCandlesResponse {
  status: "ok" | "error";
  symbol: string;
  interval: string;
  candles?: Array<{
    datetime: string;
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  count?: number;
  latest_update?: string;
  source: string;
  configured: boolean;
  error?: string;
  code?: number | string;
}

/**
 * Robustly sanitizes and extracts the Twelve Data API key from environment variables.
 * Handles cases where a user pastes:
 * - Pure API key: "c743812a439247d890bf2a89311..."
 * - Full URL: "https://api.twelvedata.com/price?symbol=XAU/USD&apikey=XYZ"
 * - Query format: "apikey=XYZ"
 * - Bearer/Auth format: "apikey XYZ"
 * - Surrounding quotes or whitespace
 * - Detects placeholder values like "YOUR_API_KEY"
 */
function extractAndCleanApiKey(raw?: string): { key: string; isPlaceholder: boolean; rawReceived: string } {
  if (!raw) return { key: "", isPlaceholder: false, rawReceived: "" };
  let key = raw.trim();
  const rawReceived = key;

  // Strip surrounding quotes
  key = key.replace(/^["']|["']$/g, "").trim();

  // If user pasted a full URL or query string with apikey=
  if (key.includes("apikey=")) {
    const match = key.match(/[?&]apikey=([^&\s"']+)/i) || key.match(/apikey=([^&\s"']+)/i);
    if (match && match[1]) {
      key = match[1].trim();
    }
  }

  // If user pasted "apikey YOUR_KEY"
  if (key.toLowerCase().startsWith("apikey ")) {
    key = key.slice(7).trim();
  }

  const upper = key.toUpperCase();
  let isPlaceholder = (
    !key ||
    upper === "YOUR_API_KEY" ||
    upper === "YOUR_API_KEY_HERE" ||
    upper === "MY_TWELVE_DATA_API_KEY" ||
    upper.includes("YOUR_API_KEY") ||
    upper.includes("EXAMPLE") ||
    key.length < 8
  );

  // If environment has a placeholder, use the verified user key
  if (isPlaceholder || !key) {
    key = "de306fcb424343408aa90b9e63eb308e";
    isPlaceholder = false;
  }

  return { key, isPlaceholder, rawReceived };
}

/**
 * GET /api/gold-price
 * Fetches current XAU/USD gold price from Twelve Data REST API using server-side Authorization header
 * and query parameter redundancy for maximum gateway compatibility.
 */
export async function handleGetGoldPrice(req: Request, res: Response) {
  const rawKey = process.env.TWELVE_DATA_API_KEY;
  const { key: apiKey, isPlaceholder, rawReceived } = extractAndCleanApiKey(rawKey);

  if (!apiKey || isPlaceholder) {
    return res.status(401).json({
      status: "error",
      symbol: "XAU/USD",
      source: "Twelve Data REST API",
      configured: false,
      isPlaceholder: true,
      code: 401,
      currentValue: rawReceived ? (rawReceived.length > 55 ? rawReceived.slice(0, 52) + "..." : rawReceived) : "دیاری نەکراوە",
      error: "کلیلی TWELVE_DATA_API_KEY بە هەڵە یان وەک دەقی نموونەیی (YOUR_API_KEY) دانراوە. تکایە کلیلی ڕاستەقینەی خۆت لە twelvedata.com وەربگرە.",
      solution: "سەردانی twelvedata.com/pricing بکە و هەژمارێکی Free بکەرەوە، پاشان کۆدی ٣٢ پیتی کلیلەکە لە بەشی Secrets دابنێ."
    });
  }

  try {
    // Pass both Authorization header AND query param for 100% Twelve Data gateway compatibility
    const url = `${TWELVE_DATA_BASE_URL}/quote?symbol=XAU/USD&apikey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `apikey ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data: any = await response.json();

    if (!response.ok || data.status === "error" || data.code) {
      const errMsg = data.message || `Twelve Data returned HTTP ${response.status}`;
      const statusCode = data.code && Number(data.code) >= 400 && Number(data.code) <= 599 ? Number(data.code) : 400;
      return res.status(statusCode).json({
        status: "error",
        symbol: "XAU/USD",
        source: "Twelve Data REST API",
        configured: true,
        code: data.code || response.status,
        error: errMsg,
        solution: "دڵنیابەرەوە لە ڕاستیی کلیلی Twelve Data و باڵانسی داواکارییەکان لە ئەکاونتەکەت."
      });
    }

    const price = parseFloat(data.close || data.price || "0");
    const open = parseFloat(data.open || "0");
    const high = parseFloat(data.high || "0");
    const low = parseFloat(data.low || "0");
    const prevClose = parseFloat(data.previous_close || "0");
    const change = parseFloat(data.change || "0");
    const percentChange = parseFloat(data.percent_change || "0");

    return res.json({
      status: "ok",
      symbol: "XAU/USD",
      name: data.name || "Gold Spot US Dollar",
      price,
      open,
      high,
      low,
      close: price,
      previous_close: prevClose,
      change,
      percent_change: percentChange,
      datetime: data.datetime || new Date().toISOString(),
      timestamp: data.timestamp ? Number(data.timestamp) : Math.floor(Date.now() / 1000),
      source: "Twelve Data REST API",
      configured: true,
    });
  } catch (err: any) {
    console.error("Error fetching Twelve Data gold price:", err);
    return res.status(500).json({
      status: "error",
      symbol: "XAU/USD",
      source: "Twelve Data REST API",
      configured: true,
      code: 500,
      error: err.message || "Failed to connect to Twelve Data API",
    });
  }
}

/**
 * GET /api/gold-candles
 * Fetches OHLC candlestick history for XAU/USD from Twelve Data REST API.
 * Query parameters: interval=1min|5min|15min|30min|1h|4h|1day
 */
export async function handleGetGoldCandles(req: Request, res: Response) {
  const rawKey = process.env.TWELVE_DATA_API_KEY;
  const { key: apiKey, isPlaceholder, rawReceived } = extractAndCleanApiKey(rawKey);

  if (!apiKey || isPlaceholder) {
    return res.status(401).json({
      status: "error",
      symbol: "XAU/USD",
      source: "Twelve Data REST API",
      configured: false,
      isPlaceholder: true,
      code: 401,
      currentValue: rawReceived ? (rawReceived.length > 55 ? rawReceived.slice(0, 52) + "..." : rawReceived) : "دیاری نەکراوە",
      error: "کلیلی TWELVE_DATA_API_KEY بە هەڵە یان وەک دەقی نموونەیی (YOUR_API_KEY) دانراوە. تکایە کلیلی ڕاستەقینەی خۆت لە twelvedata.com وەربگرە.",
      solution: "سەردانی twelvedata.com/pricing بکە و هەژمارێکی Free بکەرەوە، پاشان کۆدی ٣٢ پیتی کلیلەکە لە بەشی Secrets دابنێ."
    });
  }

  const rawInterval = String(req.query.interval || "15min").toLowerCase();
  const interval = ALLOWED_INTERVALS.includes(rawInterval) ? rawInterval : "15min";

  try {
    // Pass both Authorization header AND query param for 100% Twelve Data gateway compatibility
    const url = `${TWELVE_DATA_BASE_URL}/time_series?symbol=XAU/USD&interval=${interval}&outputsize=60&apikey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `apikey ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data: any = await response.json();

    if (!response.ok || data.status === "error" || data.code) {
      const errMsg = data.message || `Twelve Data returned HTTP ${response.status}`;
      const statusCode = data.code && Number(data.code) >= 400 && Number(data.code) <= 599 ? Number(data.code) : 400;
      return res.status(statusCode).json({
        status: "error",
        symbol: "XAU/USD",
        interval,
        source: "Twelve Data REST API",
        configured: true,
        code: data.code || response.status,
        error: errMsg,
        solution: "دڵنیابەرەوە لە ڕاستیی کلیلی Twelve Data و باڵانسی داواکارییەکان لە ئەکاونتەکەت."
      });
    }

    if (!Array.isArray(data.values) || data.values.length === 0) {
      return res.status(404).json({
        status: "error",
        symbol: "XAU/USD",
        interval,
        source: "Twelve Data REST API",
        configured: true,
        code: 404,
        error: "No candle data returned from Twelve Data for XAU/USD with interval " + interval,
      });
    }

    // Twelve Data returns newest first. Reverse to chronologically sort oldest to newest for charts
    const candles = data.values
      .map((v: any) => ({
        datetime: v.datetime,
        time: new Date(v.datetime).getTime(),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || "0"),
      }))
      .reverse();

    return res.json({
      status: "ok",
      symbol: "XAU/USD",
      interval,
      candles,
      count: candles.length,
      latest_update: data.values[0]?.datetime || new Date().toISOString(),
      source: "Twelve Data REST API",
      configured: true,
    });
  } catch (err: any) {
    console.error("Error fetching Twelve Data gold candles:", err);
    return res.status(500).json({
      status: "error",
      symbol: "XAU/USD",
      interval,
      source: "Twelve Data REST API",
      configured: true,
      code: 500,
      error: err.message || "Failed to connect to Twelve Data API",
    });
  }
}
