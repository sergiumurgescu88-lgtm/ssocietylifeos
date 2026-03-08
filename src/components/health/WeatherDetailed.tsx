import { memo, useState, useEffect, useCallback } from "react";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer, AlertTriangle, MapPin } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: { main: string; description: string; icon: string }[];
    uvi: number;
  };
  daily: {
    dt: number;
    temp: { min: number; max: number };
    weather: { main: string; description: string; icon: string }[];
    pop: number;
  }[];
  alerts?: { event: string; description: string }[];
  location?: string;
  mock?: boolean;
}

const weatherIcons: Record<string, React.ReactNode> = {
  Clear: <Sun className="h-12 w-12 text-warning" />,
  Clouds: <Cloud className="h-12 w-12 text-muted-foreground" />,
  Rain: <CloudRain className="h-12 w-12 text-accent" />,
  Drizzle: <CloudRain className="h-12 w-12 text-accent" />,
  Snow: <Snowflake className="h-12 w-12 text-accent" />,
};

const smallIcons: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Snow: "❄️",
  Thunderstorm: "⛈️",
};

function WeatherDetailedInner() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Bucharest");

  const fetchWeather = useCallback(async (lat = 44.4268, lon = 26.1025) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather?lat=${lat}&lon=${lon}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      const result = await resp.json();
      setData(result);
      if (result.location) setLocation(result.location);
    } catch {
      // Fallback handled by edge function
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try browser geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(), // Default to Bucharest
        { timeout: 5000 }
      );
    } else {
      fetchWeather();
    }
  }, [fetchWeather]);

  if (loading) return <WidgetSkeleton />;
  if (!data) return null;

  const condition = data.current.weather[0]?.main || "Clear";

  return (
    <WidgetCard
      title="Weather"
      icon={<Cloud className="h-4 w-4" />}
      accentColor="hsl(217, 91%, 60%)"
      onRefresh={() => fetchWeather()}
      isLoading={loading}
      source={data.mock ? "Mock Data" : "OpenWeatherMap"}
    >
      <div className="space-y-4">
        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-warning">{data.alerts[0].event}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{data.alerts[0].description}</p>
            </div>
          </div>
        )}

        {/* Current */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" /> {location}
            </div>
            <p className="text-5xl font-bold">{data.current.temp}°</p>
            <p className="text-sm text-muted-foreground capitalize mt-1">{data.current.weather[0]?.description}</p>
            <p className="text-xs text-muted-foreground">Feels like {data.current.feels_like}°</p>
          </div>
          {weatherIcons[condition] || <Cloud className="h-12 w-12 text-muted-foreground" />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <Droplets className="h-3.5 w-3.5 mx-auto text-accent mb-1" />
            <p className="text-xs font-medium">{data.current.humidity}%</p>
            <p className="text-[9px] text-muted-foreground">Humidity</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <Wind className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs font-medium">{data.current.wind_speed} km/h</p>
            <p className="text-[9px] text-muted-foreground">Wind</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <Thermometer className="h-3.5 w-3.5 mx-auto text-warning mb-1" />
            <p className="text-xs font-medium">{data.current.uvi}</p>
            <p className="text-[9px] text-muted-foreground">UV Index</p>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">5-Day Forecast</p>
          <div className="space-y-1.5">
            {data.daily.map((day, i) => {
              const dayName = i === 0 ? "Today" : new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
              const cond = day.weather[0]?.main || "Clear";
              return (
                <div key={day.dt} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 hover:bg-card-hover transition-colors">
                  <span className="text-xs font-medium w-12">{dayName}</span>
                  <span className="text-sm">{smallIcons[cond] || "☁️"}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{Math.round(day.temp.min)}°</span>
                    <div className="w-16 h-1.5 rounded-full bg-secondary relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-warning"
                        style={{ width: `${Math.min(100, ((day.temp.max - day.temp.min) / 20) * 100)}%` }}
                      />
                    </div>
                    <span className="font-medium">{Math.round(day.temp.max)}°</span>
                  </div>
                  {day.pop > 0 && (
                    <span className="text-[10px] text-accent">{Math.round(day.pop * 100)}%💧</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

export const WeatherDetailed = memo(WeatherDetailedInner);
