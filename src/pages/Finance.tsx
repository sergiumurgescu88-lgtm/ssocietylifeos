import { useState, useEffect, useCallback } from "react";
import {
  Wallet, DollarSign, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { PortfolioOverview } from "@/components/finance/PortfolioOverview";
import { CryptoList } from "@/components/finance/CryptoList";
import { TransactionHistory } from "@/components/finance/TransactionHistory";
import { UpgradeCard } from "@/components/finance/UpgradeCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { fetchCryptoMarkets, CoinMarket, MOCK_HOLDINGS } from "@/lib/financeService";
import { Button } from "@/components/ui/button";

// Mock stock data
const stocksMock = [
  { symbol: "AAPL", name: "Apple", price: 189.84, change: 1.23 },
  { symbol: "MSFT", name: "Microsoft", price: 415.56, change: -0.45 },
  { symbol: "NVDA", name: "NVIDIA", price: 875.35, change: 3.67 },
  { symbol: "TSLA", name: "Tesla", price: 177.29, change: -2.12 },
];

export default function Finance() {
  const [markets, setMarkets] = useState<CoinMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMarkets = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCryptoMarkets();
    setMarkets(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  // Calculate stats from real data
  const totalCrypto = markets
    .filter((m) => MOCK_HOLDINGS[m.id])
    .reduce((s, m) => s + MOCK_HOLDINGS[m.id] * m.current_price, 0);
  const totalStocks = stocksMock.reduce((s, st) => s + st.price * 10, 0); // mock 10 shares each
  const totalBalance = totalCrypto + totalStocks + 5240.32; // + cash

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="gradient-text">Finance</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track crypto, stocks & payments</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadMarkets}
          className="text-muted-foreground"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WidgetCard title="Total Balance" icon={<DollarSign className="h-4 w-4" />} accentColor="hsl(262, 83%, 58%)">
          <p className="text-2xl font-bold">${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-1 text-success text-xs">
            <TrendingUp className="h-3 w-3" /> +4.2% this month
          </div>
        </WidgetCard>

        <WidgetCard title="Crypto" icon={<TrendingUp className="h-4 w-4" />} accentColor="hsl(38, 92%, 50%)">
          <p className="text-2xl font-bold">${totalCrypto.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-1">{Object.keys(MOCK_HOLDINGS).length} assets</p>
        </WidgetCard>

        <WidgetCard title="Stocks" icon={<ArrowUpRight className="h-4 w-4" />} accentColor="hsl(217, 91%, 60%)">
          <p className="text-2xl font-bold">${totalStocks.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-1">{stocksMock.length} positions</p>
        </WidgetCard>

        <WidgetCard title="Cash" icon={<ArrowDownRight className="h-4 w-4" />} accentColor="hsl(142, 71%, 45%)">
          <p className="text-2xl font-bold">$5,240.32</p>
          <p className="text-xs text-muted-foreground mt-1">Available balance</p>
        </WidgetCard>
      </div>

      {/* Portfolio Overview + Upgrade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {isLoading ? (
            <WidgetSkeleton />
          ) : (
            <PortfolioOverview markets={markets} />
          )}
        </div>
        <div className="space-y-4">
          <UpgradeCard />

          {/* Stocks mini table */}
          <WidgetCard title="Stock Watchlist" accentColor="hsl(217, 91%, 60%)" source="EODHD Mock">
            <div className="space-y-2">
              {stocksMock.map((s) => (
                <div key={s.symbol} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 hover:bg-card-hover transition-colors">
                  <div>
                    <p className="text-sm font-medium">{s.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${s.price}</p>
                    <p className={`text-[10px] ${s.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {s.change >= 0 ? "+" : ""}{s.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </WidgetCard>
        </div>
      </div>

      {/* Crypto List */}
      {isLoading ? (
        <WidgetSkeleton />
      ) : (
        <CryptoList markets={markets} onRefresh={loadMarkets} isLoading={isLoading} />
      )}

      {/* Transactions */}
      <TransactionHistory />
    </div>
  );
}
