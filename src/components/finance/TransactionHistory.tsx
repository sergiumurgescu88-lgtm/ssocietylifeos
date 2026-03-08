import { memo, useState } from "react";
import { Receipt, Download, Filter } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { Button } from "@/components/ui/button";
import { Transaction, getMockTransactions, exportToCSV } from "@/lib/financeService";
import { toast } from "sonner";

const typeLabels: Record<string, { label: string; color: string }> = {
  buy: { label: "Buy", color: "text-success" },
  sell: { label: "Sell", color: "text-warning" },
  deposit: { label: "Deposit", color: "text-primary" },
  withdrawal: { label: "Withdrawal", color: "text-destructive" },
  subscription: { label: "Subscription", color: "text-accent" },
};

const filterOptions = ["all", "buy", "sell", "deposit", "withdrawal", "subscription"] as const;

function TransactionHistoryInner() {
  const transactions = getMockTransactions();
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const handleExport = () => {
    exportToCSV(filtered);
    toast.success("CSV exportat cu succes!");
  };

  return (
    <WidgetCard
      title="Transaction History"
      icon={<Receipt className="h-4 w-4" />}
      accentColor="hsl(262, 83%, 58%)"
    >
      <div className="space-y-3">
        {/* Filters & Export */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors capitalize ${
                  filter === f
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
        </div>

        {/* List */}
        <div className="space-y-1.5">
          {filtered.map((t) => {
            const config = typeLabels[t.type] || typeLabels.buy;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5 hover:bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.asset}</p>
                    <p className="text-[10px] text-muted-foreground">{t.date}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${t.value >= 0 ? "text-success" : "text-foreground"}`}>
                    {t.value >= 0 ? "+" : ""}${Math.abs(t.value).toFixed(2)}
                  </p>
                  {t.type !== "subscription" && (
                    <p className="text-[10px] text-muted-foreground">{t.amount} {t.asset}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

export const TransactionHistory = memo(TransactionHistoryInner);
