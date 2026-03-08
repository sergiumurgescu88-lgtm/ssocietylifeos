import { supabase } from "@/integrations/supabase/client";

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: { price: number[] };
}

export interface MarketChart {
  prices: [number, number][];
}

// Mock holdings (user's portfolio)
export const MOCK_HOLDINGS: Record<string, number> = {
  bitcoin: 0.05,
  ethereum: 1.2,
  solana: 15,
  cardano: 500,
  polkadot: 30,
};

const CACHE_KEY = "lifeos_crypto_cache";
const CACHE_TTL = 3 * 60 * 1000; // 3 min

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// Mock data for when CoinGecko is rate limited
const MOCK_MARKETS: CoinMarket[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "", current_price: 67234, market_cap: 1320000000000, market_cap_rank: 1, total_volume: 28000000000, price_change_percentage_24h: 2.34, price_change_percentage_1h_in_currency: 0.12, price_change_percentage_7d_in_currency: 5.67, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 65000 + Math.sin(i/10)*2000 + Math.random()*500) } },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: "", current_price: 3421, market_cap: 411000000000, market_cap_rank: 2, total_volume: 15000000000, price_change_percentage_24h: -1.12, price_change_percentage_1h_in_currency: -0.05, price_change_percentage_7d_in_currency: 3.21, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 3300 + Math.sin(i/8)*200 + Math.random()*50) } },
  { id: "solana", symbol: "sol", name: "Solana", image: "", current_price: 148.5, market_cap: 65000000000, market_cap_rank: 5, total_volume: 3200000000, price_change_percentage_24h: 5.67, price_change_percentage_1h_in_currency: 0.45, price_change_percentage_7d_in_currency: 12.3, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 135 + Math.sin(i/12)*15 + Math.random()*5) } },
  { id: "cardano", symbol: "ada", name: "Cardano", image: "", current_price: 0.45, market_cap: 16000000000, market_cap_rank: 9, total_volume: 420000000, price_change_percentage_24h: 1.23, price_change_percentage_1h_in_currency: 0.08, price_change_percentage_7d_in_currency: -2.1, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 0.43 + Math.sin(i/15)*0.03 + Math.random()*0.01) } },
  { id: "polkadot", symbol: "dot", name: "Polkadot", image: "", current_price: 7.12, market_cap: 9800000000, market_cap_rank: 13, total_volume: 280000000, price_change_percentage_24h: -0.87, price_change_percentage_1h_in_currency: -0.15, price_change_percentage_7d_in_currency: 1.45, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 6.8 + Math.sin(i/10)*0.5 + Math.random()*0.2) } },
  { id: "ripple", symbol: "xrp", name: "XRP", image: "", current_price: 0.52, market_cap: 28000000000, market_cap_rank: 6, total_volume: 1200000000, price_change_percentage_24h: 0.98, price_change_percentage_1h_in_currency: 0.02, price_change_percentage_7d_in_currency: 4.56, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 0.50 + Math.sin(i/11)*0.03 + Math.random()*0.01) } },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin", image: "", current_price: 0.082, market_cap: 11500000000, market_cap_rank: 8, total_volume: 520000000, price_change_percentage_24h: 3.45, price_change_percentage_1h_in_currency: 0.67, price_change_percentage_7d_in_currency: -1.23, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 0.078 + Math.sin(i/9)*0.005 + Math.random()*0.002) } },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche", image: "", current_price: 35.4, market_cap: 13200000000, market_cap_rank: 10, total_volume: 680000000, price_change_percentage_24h: -2.1, price_change_percentage_1h_in_currency: -0.32, price_change_percentage_7d_in_currency: 6.78, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 33 + Math.sin(i/10)*3 + Math.random()*1) } },
  { id: "chainlink", symbol: "link", name: "Chainlink", image: "", current_price: 14.8, market_cap: 8900000000, market_cap_rank: 14, total_volume: 450000000, price_change_percentage_24h: 1.87, price_change_percentage_1h_in_currency: 0.21, price_change_percentage_7d_in_currency: 8.9, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 13.5 + Math.sin(i/8)*1.5 + Math.random()*0.5) } },
  { id: "polygon", symbol: "matic", name: "Polygon", image: "", current_price: 0.72, market_cap: 6700000000, market_cap_rank: 16, total_volume: 310000000, price_change_percentage_24h: 0.45, price_change_percentage_1h_in_currency: 0.01, price_change_percentage_7d_in_currency: -3.2, sparkline_in_7d: { price: Array.from({length:168}, (_,i) => 0.70 + Math.sin(i/12)*0.04 + Math.random()*0.01) } },
];

export async function fetchCryptoMarkets(): Promise<CoinMarket[]> {
  const cached = getCache<CoinMarket[]>(CACHE_KEY + "_markets");
  if (cached) return cached;

  try {
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-prices?endpoint=markets`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }
    );

    if (!resp.ok) throw new Error("API error");
    const result = await resp.json();

    if (result.rateLimited || !Array.isArray(result)) {
      setCache(CACHE_KEY + "_markets", MOCK_MARKETS);
      return MOCK_MARKETS;
    }

    setCache(CACHE_KEY + "_markets", result);
    return result;
  } catch {
    return MOCK_MARKETS;
  }
}

export async function fetchMarketChart(coinId: string, days: string): Promise<MarketChart> {
  const cacheKey = `${CACHE_KEY}_chart_${coinId}_${days}`;
  const cached = getCache<MarketChart>(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-prices?endpoint=market_chart&coin_id=${coinId}&days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }
    );

    if (!resp.ok) throw new Error("API error");
    const result = await resp.json();

    if (result.rateLimited || !result.prices) {
      // Generate mock chart data
      const now = Date.now();
      const numDays = parseInt(days) || 7;
      const points = numDays * 24;
      const basePrice = coinId === "bitcoin" ? 67000 : coinId === "ethereum" ? 3400 : 148;
      const mockPrices: [number, number][] = Array.from({ length: points }, (_, i) => [
        now - (points - i) * 3600000,
        basePrice + Math.sin(i / 10) * basePrice * 0.05 + Math.random() * basePrice * 0.01,
      ]);
      const mockData = { prices: mockPrices };
      setCache(cacheKey, mockData);
      return mockData;
    }

    setCache(cacheKey, result);
    return result;
  } catch {
    const now = Date.now();
    const basePrice = coinId === "bitcoin" ? 67000 : 3400;
    const mockPrices: [number, number][] = Array.from({ length: 168 }, (_, i) => [
      now - (168 - i) * 3600000,
      basePrice + Math.sin(i / 10) * basePrice * 0.05,
    ]);
    return { prices: mockPrices };
  }
}

// Mock transactions
export interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "subscription";
  asset: string;
  amount: number;
  value: number;
  date: string;
  status: "completed" | "pending";
}

export function getMockTransactions(): Transaction[] {
  return [
    { id: "tx1", type: "buy", asset: "BTC", amount: 0.01, value: 672.34, date: "2026-03-08", status: "completed" },
    { id: "tx2", type: "sell", asset: "ETH", amount: 0.5, value: 1710.50, date: "2026-03-07", status: "completed" },
    { id: "tx3", type: "deposit", asset: "USD", amount: 2000, value: 2000, date: "2026-03-05", status: "completed" },
    { id: "tx4", type: "subscription", asset: "PRO Plan", amount: 1, value: -9.99, date: "2026-03-01", status: "completed" },
    { id: "tx5", type: "buy", asset: "SOL", amount: 5, value: 742.50, date: "2026-02-28", status: "completed" },
    { id: "tx6", type: "withdrawal", asset: "USD", amount: 500, value: -500, date: "2026-02-25", status: "completed" },
    { id: "tx7", type: "buy", asset: "ADA", amount: 200, value: 90.00, date: "2026-02-20", status: "completed" },
    { id: "tx8", type: "sell", asset: "DOT", amount: 10, value: 71.20, date: "2026-02-18", status: "pending" },
  ];
}

export function exportToCSV(transactions: Transaction[]) {
  const headers = "Date,Type,Asset,Amount,Value (USD),Status\n";
  const rows = transactions
    .map((t) => `${t.date},${t.type},${t.asset},${t.amount},${t.value.toFixed(2)},${t.status}`)
    .join("\n");

  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifeos_finance_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
