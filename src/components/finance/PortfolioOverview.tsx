import { memo } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CoinMarket, MOCK_HOLDINGS } from "@/lib/financeService";

const COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
];

interface Props {
  markets: CoinMarket[];
}

function PortfolioOverviewInner({ markets }: Props) {
  const holdings = markets
    .filter((m) => MOCK_HOLDINGS[m.id])
    .map((m) => ({
      name: m.symbol.toUpperCase(),
      value: Math.round(MOCK_HOLDINGS[m.id] * m.current_price * 100) / 100,
      change: m.price_change_percentage_24h,
    }));

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);
  const weightedChange =
    holdings.reduce((s, h) => s + h.change * (h.value / totalValue), 0);

  return (
    <WidgetCard
      title="Portfolio Overview"
      icon={<DollarSign className="h-4 w-4" />}
      accentColor="hsl(38, 92%, 50%)"
      colSpan={2}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Total */}
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Total Portfolio Value</p>
          <p className="text-4xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className={`flex items-center gap-1 mt-1 text-sm ${weightedChange >= 0 ? "text-success" : "text-destructive"}`}>
            {weightedChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {weightedChange >= 0 ? "+" : ""}{weightedChange.toFixed(2)}% (24h)
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {holdings.map((h, i) => (
              <div key={h.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{h.name}</span>
                <span className="font-medium">${h.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={holdings}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {holdings.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                contentStyle={{
                  background: "hsl(224, 25%, 11%)",
                  border: "1px solid hsl(224, 15%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}

export const PortfolioOverview = memo(PortfolioOverviewInner);
