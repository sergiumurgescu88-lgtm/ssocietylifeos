import { memo, useState, useEffect } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, CartesianGrid,
} from "recharts";

interface HealthLog {
  log_date: string;
  steps: number;
  water_liters: number;
  sleep_hours: number;
  mood: number | null;
  calories: number;
}

const moodEmojis = ["", "😫", "😕", "😐", "😊", "🔥"];

function HealthStatsInner({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [chartType, setChartType] = useState<"sleep" | "steps" | "water" | "mood">("sleep");

  useEffect(() => {
    if (!user) return;
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).toISOString().split("T")[0];
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).toISOString().split("T")[0];

    setLoading(true);
    supabase
      .from("health_logs")
      .select("log_date, steps, water_liters, sleep_hours, mood, calories")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end)
      .order("log_date")
      .then(({ data }) => {
        setLogs((data as HealthLog[]) || []);
        setLoading(false);
      });
  }, [user, viewMonth, refreshKey]);

  const chartData = logs.map((l) => ({
    day: new Date(l.log_date).getDate(),
    sleep: Number(l.sleep_hours),
    steps: l.steps,
    water: Number(l.water_liters),
    mood: l.mood,
  }));

  const monthLabel = viewMonth.toLocaleDateString("ro-RO", { month: "long", year: "numeric" });

  const handleDeleteAll = async () => {
    if (!user) return;
    if (!confirm("Ești sigur? Toate datele de sănătate vor fi șterse permanent.")) return;
    const { error } = await supabase.from("health_logs").delete().eq("user_id", user.id);
    if (error) {
      toast.error("Eroare la ștergere");
    } else {
      setLogs([]);
      toast.success("Toate datele de sănătate au fost șterse");
    }
  };

  // Calendar grid
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const logMap = new Map(logs.map((l) => [new Date(l.log_date).getDate(), l]));

  return (
    <WidgetCard
      title="Health History"
      icon={<BarChart3 className="h-4 w-4" />}
      accentColor="hsl(142, 71%, 45%)"
      colSpan={2}
    >
      <div className="space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground py-1">{d}</span>
          ))}
          {Array.from({ length: (firstDay + 6) % 7 }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const log = logMap.get(day);
            const today = new Date();
            const isToday = day === today.getDate() && viewMonth.getMonth() === today.getMonth() && viewMonth.getFullYear() === today.getFullYear();

            return (
              <div
                key={day}
                className={`relative h-8 w-full rounded-md flex items-center justify-center text-xs transition-colors ${
                  isToday ? "ring-1 ring-primary" : ""
                } ${log ? "bg-success/20 text-success font-medium" : "bg-secondary/20 text-muted-foreground"}`}
              >
                {day}
                {log?.mood && (
                  <span className="absolute -top-1 -right-1 text-[8px]">{moodEmojis[log.mood]}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Chart type selector */}
        <div className="flex gap-1">
          {(["sleep", "steps", "water", "mood"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                chartType === t ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            {chartType === "mood" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 15%, 18%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(218, 11%, 55%)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "hsl(218, 11%, 55%)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(224, 25%, 11%)", border: "1px solid hsl(224, 15%, 18%)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="mood" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: "hsl(38, 92%, 50%)", r: 3 }} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 15%, 18%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(218, 11%, 55%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(218, 11%, 55%)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(224, 25%, 11%)", border: "1px solid hsl(224, 15%, 18%)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar
                  dataKey={chartType}
                  fill={chartType === "sleep" ? "hsl(262, 83%, 58%)" : chartType === "steps" ? "hsl(142, 71%, 45%)" : "hsl(217, 91%, 60%)"}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            {loading ? "Se încarcă..." : "Nu există date pentru această lună"}
          </div>
        )}

        {/* Delete all */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-destructive hover:bg-destructive/10 w-full"
          onClick={handleDeleteAll}
        >
          <Trash2 className="h-3 w-3 mr-1" /> Șterge toate datele de sănătate
        </Button>
      </div>
    </WidgetCard>
  );
}

export const HealthStats = memo(HealthStatsInner);
