import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Bitcoin, DollarSign, PiggyBank } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";

const transactions = [
  { id: 1, name: "Netflix", amount: -15.99, category: "Entertainment", date: "Today" },
  { id: 2, name: "Salary", amount: 3200, category: "Income", date: "Mar 1" },
  { id: 3, name: "Grocery", amount: -67.5, category: "Food", date: "Mar 6" },
  { id: 4, name: "Uber", amount: -12.3, category: "Transport", date: "Mar 5" },
  { id: 5, name: "Freelance", amount: 450, category: "Income", date: "Mar 4" },
];

const cryptoPortfolio = [
  { symbol: "BTC", name: "Bitcoin", amount: 0.05, price: 67234, change: 2.3 },
  { symbol: "ETH", name: "Ethereum", amount: 1.2, price: 3421, change: -1.1 },
  { symbol: "SOL", name: "Solana", amount: 15, price: 148, change: 5.7 },
];

export default function Finance() {
  const totalBalance = 12450.67;
  const monthlyIncome = 3650;
  const monthlyExpenses = 1234.56;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="gradient-text">Finance</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track your finances and crypto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WidgetCard title="Total Balance" icon={<DollarSign className="h-4 w-4" />}>
          <p className="text-3xl font-bold">${totalBalance.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1 text-success text-sm">
            <TrendingUp className="h-3 w-3" /> +4.2% this month
          </div>
        </WidgetCard>

        <WidgetCard title="Monthly Income" icon={<ArrowUpRight className="h-4 w-4" />}>
          <p className="text-3xl font-bold text-success">${monthlyIncome.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">From 2 sources</p>
        </WidgetCard>

        <WidgetCard title="Monthly Expenses" icon={<ArrowDownRight className="h-4 w-4" />}>
          <p className="text-3xl font-bold text-destructive">${monthlyExpenses.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">5 transactions</p>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard title="Recent Transactions" icon={<PiggyBank className="h-4 w-4" />}>
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.date}</p>
                </div>
                <span className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                  {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Crypto Portfolio" icon={<Bitcoin className="h-4 w-4" />}>
          <div className="space-y-3">
            {cryptoPortfolio.map((c) => (
              <div key={c.symbol} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{c.symbol}</p>
                  <p className="text-xs text-muted-foreground">{c.amount} {c.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${(c.amount * c.price).toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-xs ${c.change > 0 ? "text-success" : "text-destructive"}`}>
                    {c.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {c.change > 0 ? "+" : ""}{c.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
