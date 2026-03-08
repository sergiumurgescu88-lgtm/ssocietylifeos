import { memo, useCallback } from "react";
import { Heart, Footprints, Droplets, Moon, Flame, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { Progress } from "@/components/ui/progress";
import { useWidgetData } from "@/hooks/useWidgetData";
import { fetchHealthMock, HealthData } from "@/lib/mockData";

function HealthStatusInner() {
  const navigate = useNavigate();
  const fetcher = useCallback(() => fetchHealthMock(), []);
  const { data, isLoading, error, lastUpdated, refresh } = useWidgetData<HealthData>("health", fetcher);

  if (isLoading && !data) return <WidgetSkeleton />;

  return (
    <WidgetCard
      title="Health"
      icon={<Heart className="h-4 w-4" />}
      accentColor="hsl(142, 71%, 45%)"
      lastUpdated={lastUpdated}
      source="HealthKit Mock"
      isLoading={isLoading}
      error={error}
      onRefresh={refresh}
      onClick={() => navigate("/health")}
      delay={3}
    >
      {data && (
        <div className="space-y-3">
          {/* Steps */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Footprints className="h-3.5 w-3.5" /> Steps
              </span>
              <span className="font-medium text-xs">{data.steps.current.toLocaleString()}/{data.steps.goal.toLocaleString()}</span>
            </div>
            <Progress value={(data.steps.current / data.steps.goal) * 100} className="h-1.5 bg-secondary" />
          </div>

          {/* Water */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" /> Water
              </span>
              <span className="font-medium text-xs">{data.water.current}{data.water.unit}/{data.water.goal}{data.water.unit}</span>
            </div>
            <Progress value={(data.water.current / data.water.goal) * 100} className="h-1.5 bg-secondary" />
          </div>

          {/* Sleep */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Moon className="h-3.5 w-3.5" /> Sleep
              </span>
              <span className="font-medium text-xs">{data.sleep.hours}h · {data.sleep.quality}% quality</span>
            </div>
            <Progress value={(data.sleep.hours / 8) * 100} className="h-1.5 bg-secondary" />
          </div>

          {/* Bottom stats */}
          <div className="flex gap-2 pt-1">
            <div className="flex-1 rounded-lg bg-secondary/40 p-2 text-center">
              <Activity className="h-3.5 w-3.5 mx-auto text-destructive mb-0.5" />
              <p className="text-xs font-semibold">{data.heartRate}</p>
              <p className="text-[9px] text-muted-foreground">BPM</p>
            </div>
            <div className="flex-1 rounded-lg bg-secondary/40 p-2 text-center">
              <Flame className="h-3.5 w-3.5 mx-auto text-warning mb-0.5" />
              <p className="text-xs font-semibold">{data.calories.burned}</p>
              <p className="text-[9px] text-muted-foreground">kcal</p>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

export const HealthStatus = memo(HealthStatusInner);
