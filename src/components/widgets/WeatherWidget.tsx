import { memo, useCallback } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Droplets, Wind } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { useWidgetData } from "@/hooks/useWidgetData";
import { fetchWeatherMock, WeatherData } from "@/lib/mockData";

const conditionIcons: Record<string, React.ReactNode> = {
  Sunny: <Sun className="h-10 w-10 text-warning" />,
  "Partly Cloudy": <Cloud className="h-10 w-10 text-muted-foreground" />,
  Cloudy: <Cloud className="h-10 w-10 text-muted-foreground" />,
  Rainy: <CloudRain className="h-10 w-10 text-accent" />,
  Stormy: <CloudLightning className="h-10 w-10 text-warning" />,
  Snowy: <CloudSnow className="h-10 w-10 text-accent" />,
};

function WeatherWidgetInner() {
  const fetcher = useCallback(() => fetchWeatherMock(), []);
  const { data, isLoading, error, lastUpdated, refresh } = useWidgetData<WeatherData>("weather", fetcher);

  if (isLoading && !data) return <WidgetSkeleton />;

  return (
    <WidgetCard
      title="Weather"
      icon={<Cloud className="h-4 w-4" />}
      accentColor="hsl(38, 92%, 50%)"
      lastUpdated={lastUpdated}
      source="MockWeather"
      isLoading={isLoading}
      error={error}
      onRefresh={refresh}
      delay={0}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{data.temp}°C</p>
              <p className="text-xs text-muted-foreground">Feels like {data.feelsLike}°C</p>
              <p className="text-sm text-muted-foreground mt-0.5">{data.condition}</p>
            </div>
            {conditionIcons[data.condition] || <Sun className="h-10 w-10 text-warning" />}
          </div>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" /> {data.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" /> {data.windSpeed} km/h
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            {data.forecast.map((f) => (
              <div key={f.day} className="flex-1 rounded-lg bg-secondary/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground">{f.day}</p>
                <p className="text-sm">{f.condition}</p>
                <p className="text-xs font-medium">{f.temp}°</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">📍 {data.location}</p>
        </div>
      )}
    </WidgetCard>
  );
}

export const WeatherWidget = memo(WeatherWidgetInner);
