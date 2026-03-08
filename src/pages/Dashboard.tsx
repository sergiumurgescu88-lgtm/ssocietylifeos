import { useAuth } from "@/contexts/AuthContext";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { CryptoTicker } from "@/components/widgets/CryptoTicker";
import { AIQuickAction } from "@/components/widgets/AIQuickAction";
import { HealthStatus } from "@/components/widgets/HealthStatus";
import { NewsFeed } from "@/components/widgets/NewsFeed";
import { TaskList } from "@/components/widgets/TaskList";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "@/components/WidgetCard";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            Good morning, <span className="gradient-text">{profile?.full_name || "User"}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your daily overview</p>
        </div>
        <SubscriptionBadge plan={profile?.plan_type ?? "free"} />
      </div>

      {/* AI Usage Bar */}
      <WidgetCard
        title="AI Queries"
        icon={<Sparkles className="h-4 w-4" />}
        accentColor="hsl(262, 83%, 58%)"
        className="!p-4"
      >
        <div className="flex items-center gap-4">
          <Progress
            value={((profile?.ai_queries_used ?? 0) / (profile?.ai_queries_limit ?? 1)) * 100}
            className="h-2 bg-secondary flex-1"
          />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {profile?.ai_queries_used ?? 0}/{profile?.ai_queries_limit ?? 50} used
          </span>
        </div>
      </WidgetCard>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WeatherWidget />
        <CryptoTicker />
        <AIQuickAction />
        <HealthStatus />
        <NewsFeed />
        <TaskList />
      </div>
    </div>
  );
}
