import { memo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Bitcoin } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { MiniSparkline } from "@/components/MiniSparkline";
import { CoinMarket, MOCK_HOLDINGS } from "@/lib/financeService";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { fetchMarketChart } from "@/lib/financeService";

interface Props {
  markets: CoinMarket[];
  onRefresh: () => void;
  isLoading: boolean;
}

const timeRanges = [
  { label: "7D", days: "7" },
  { label: "1M", days: "30" },
  { label: "1Y", days: "365" },
];

function CryptoListInner({ markets, onRefresh, isLoading }: Props) {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState("7");
  const [chartData, setChartData] = useState<{ time: string; price: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!selectedCoin) return;
    setChartLoading(true);
    fetchMarketChart(selectedCoin, selectedRange)
      .then((data) => {
        const formatted = data.prices
          .filter((_, i) => i % Math.max(1, Math.floor(data.prices.length / 100)) === 0)
          .map(([ts, price]) => ({
            time: new Date(ts).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" }),
            price: Math.round(price * 100) / 100,
          }));
        setChartData(formatted);
      })
      .finally(() => setChartLoading(false));
  }, [selectedCoin, selectedRange]);

  return (
    <WidgetCard
      title="Crypto Markets"
      icon={<Bitcoin className="h-4 w-4" />}
      accentColor="hsl(38, 92%, 50%)"
      onRefresh={onRefresh}
      isLoading={isLoading}
      source="CoinGecko"
      colSpan={2}
    >
      <div className="space-y-4">
        {/* Chart */}
        {selectedCoin && (
          <div className="glass-card rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium capitalize">{selectedCoin} Price</p>
              <div className="flex gap-1">
                {timeRanges.map((r) => (
                  <button
                    key={r.days}
                    onClick={() => setSelectedRange(r.days)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedRange === r.days
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedCoin(null)}
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            {chartLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "hsl(218, 11%, 55%)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(218, 11%, 55%)" }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    width={60}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(224, 25%, 11%)",
                      border: "1px solid hsl(224, 15%, 18%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(262, 83%, 58%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/30">
                <th className="text-left py-2 font-medium">#</th>
                <th className="text-left py-2 font-medium">Asset</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium hidden sm:table-cell">1h</th>
                <th className="text-right py-2 font-medium">24h</th>
                <th className="text-right py-2 font-medium hidden md:table-cell">7d</th>
                <th className="text-right py-2 font-medium hidden lg:table-cell">Holdings</th>
                <th className="text-right py-2 font-medium hidden sm:table-cell">7D Chart</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((coin) => {
                const holding = MOCK_HOLDINGS[coin.id];
                const holdingValue = holding ? holding * coin.current_price : 0;
                return (
                  <tr
                    key={coin.id}
                    className="border-b border-border/20 hover:bg-card-hover transition-colors cursor-pointer"
                    onClick={() => setSelectedCoin(selectedCoin === coin.id ? null : coin.id)}
                  >
                    <td className="py-2.5 text-muted-foreground">{coin.market_cap_rank}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        {coin.image ? (
                          <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-secondary" />
                        )}
                        <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{coin.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                    </td>
                    <td className={`py-2.5 text-right hidden sm:table-cell ${(coin.price_change_percentage_1h_in_currency ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                      {(coin.price_change_percentage_1h_in_currency ?? 0) >= 0 ? "+" : ""}
                      {(coin.price_change_percentage_1h_in_currency ?? 0).toFixed(2)}%
                    </td>
                    <td className={`py-2.5 text-right ${coin.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className={`py-2.5 text-right hidden md:table-cell ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                      {(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "+" : ""}
                      {(coin.price_change_percentage_7d_in_currency ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right hidden lg:table-cell">
                      {holding ? (
                        <div>
                          <p className="font-medium">${holdingValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          <p className="text-[10px] text-muted-foreground">{holding} {coin.symbol.toUpperCase()}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right hidden sm:table-cell">
                      {coin.sparkline_in_7d?.price && (
                        <div className="flex justify-end">
                          <MiniSparkline
                            data={coin.sparkline_in_7d.price}
                            color={coin.price_change_percentage_24h >= 0 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
                            width={60}
                            height={24}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </WidgetCard>
  );
}

export const CryptoList = memo(CryptoListInner);
