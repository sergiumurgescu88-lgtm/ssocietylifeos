import { memo, useCallback } from "react";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { MiniSparkline } from "@/components/MiniSparkline";
import { useWidgetData } from "@/hooks/useWidgetData";
import { fetchCryptoMock, CryptoAsset } from "@/lib/mockData";

function CryptoTickerInner() {
  const navigate = useNavigate();
  const fetcher = useCallback(() => fetchCryptoMock(), []);
  const { data, isLoading, error, lastUpdated, refresh } = useWidgetData<CryptoAsset[]>("crypto", fetcher);

  if (isLoading && !data) return <WidgetSkeleton />;

  return (
    <WidgetCard
      title="Crypto"
      icon={<Bitcoin className="h-4 w-4" />}
      accentColor="hsl(38, 92%, 50%)"
      lastUpdated={lastUpdated}
      source="MockMarket"
      isLoading={isLoading}
      error={error}
      onRefresh={refresh}
      onClick={() => navigate("/finance")}
      delay={1}
    >
      {data && (
        <div className="space-y-3">
          {data.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{asset.symbol}</p>
                <p className="text-[10px] text-muted-foreground">{asset.name}</p>
              </div>
              <MiniSparkline
                data={asset.sparkline}
                color={asset.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              />
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">${asset.price.toLocaleString()}</p>
                <div className={`flex items-center justify-end gap-0.5 text-xs ${asset.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                  {asset.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export const CryptoTicker = memo(CryptoTickerInner);
