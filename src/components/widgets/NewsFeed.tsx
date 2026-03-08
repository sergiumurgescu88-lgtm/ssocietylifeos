import { memo, useCallback } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { useWidgetData } from "@/hooks/useWidgetData";
import { fetchNewsMock, NewsItem } from "@/lib/mockData";

const categoryColors: Record<string, string> = {
  Tech: "bg-primary/10 text-primary",
  Crypto: "bg-warning/10 text-warning",
  Business: "bg-accent/10 text-accent",
  Health: "bg-success/10 text-success",
};

function NewsFeedInner() {
  const fetcher = useCallback(() => fetchNewsMock(), []);
  const { data, isLoading, error, lastUpdated, refresh } = useWidgetData<NewsItem[]>("news", fetcher);

  if (isLoading && !data) return <WidgetSkeleton />;

  return (
    <WidgetCard
      title="News Feed"
      icon={<Newspaper className="h-4 w-4" />}
      accentColor="hsl(217, 91%, 60%)"
      lastUpdated={lastUpdated}
      source="MockNews"
      isLoading={isLoading}
      error={error}
      onRefresh={refresh}
      colSpan={2}
      delay={4}
    >
      {data && (
        <div className="space-y-2">
          {data.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg bg-secondary/30 px-3 py-2.5 hover:bg-card-hover transition-colors cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${categoryColors[item.category] ?? "bg-muted text-muted-foreground"}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{item.source}</span>
                  <span className="text-[10px] text-muted-foreground">· {item.timeAgo}</span>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export const NewsFeed = memo(NewsFeedInner);
