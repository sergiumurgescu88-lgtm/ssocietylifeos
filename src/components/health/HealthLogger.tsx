import { memo, useState, useEffect } from "react";
import { Activity, Footprints, Droplets, Moon, Flame, Smile, Save, Sparkles } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const moodEmojis = ["😫", "😕", "😐", "😊", "🔥"];

interface HealthLogData {
  steps: number;
  water_liters: number;
  sleep_hours: number;
  mood: number;
  calories: number;
  notes: string;
}

function HealthLoggerInner({ onSaved }: { onSaved?: () => void }) {
  const { user, profile } = useAuth();
  const [data, setData] = useState<HealthLogData>({
    steps: 0, water_liters: 0, sleep_hours: 0, mood: 3, calories: 0, notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [aiTip, setAiTip] = useState<string>("");
  const [tipLoading, setTipLoading] = useState(false);

  // Load today's log if exists
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("health_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle()
      .then(({ data: log }) => {
        if (log) {
          setData({
            steps: log.steps || 0,
            water_liters: Number(log.water_liters) || 0,
            sleep_hours: Number(log.sleep_hours) || 0,
            mood: log.mood || 3,
            calories: log.calories || 0,
            notes: log.notes || "",
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      // Upsert today's log
      const { error } = await supabase
        .from("health_logs")
        .upsert(
          { user_id: user.id, log_date: today, ...data },
          { onConflict: "user_id,log_date" }
        );

      if (error) throw error;
      toast.success("Date de sănătate salvate!");
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message || "Eroare la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchAITip = async () => {
    setTipLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-insight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            healthData: {
              steps: data.steps,
              water: data.water_liters,
              sleep: data.sleep_hours,
              mood: data.mood,
              calories: data.calories,
            },
            userName: profile?.full_name,
          }),
        }
      );
      const result = await resp.json();
      setAiTip(result.tip);
    } catch {
      setAiTip("🌟 Continuă să îți monitorizezi sănătatea zilnic!");
    } finally {
      setTipLoading(false);
    }
  };

  const ProgressRing = ({ value, max, color, label, icon: Icon }: {
    value: number; max: number; color: string; label: string; icon: any;
  }) => {
    const pct = Math.min(100, (value / max) * 100);
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
            <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold">{Math.round(pct)}%</p>
      </div>
    );
  };

  return (
    <WidgetCard
      title="Health Logger"
      icon={<Activity className="h-4 w-4" />}
      accentColor="hsl(142, 71%, 45%)"
      colSpan={2}
    >
      <div className="space-y-5">
        {/* Progress Rings */}
        <div className="flex justify-around py-2">
          <ProgressRing value={data.steps} max={10000} color="hsl(142, 71%, 45%)" label="Steps" icon={Footprints} />
          <ProgressRing value={data.water_liters} max={2.5} color="hsl(217, 91%, 60%)" label="Water" icon={Droplets} />
          <ProgressRing value={data.sleep_hours} max={8} color="hsl(262, 83%, 58%)" label="Sleep" icon={Moon} />
          <ProgressRing value={data.calories} max={2200} color="hsl(38, 92%, 50%)" label="Calories" icon={Flame} />
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
              <Footprints className="h-3 w-3" /> Steps
            </label>
            <Input
              type="number"
              value={data.steps || ""}
              onChange={(e) => setData((d) => ({ ...d, steps: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="bg-secondary/50 border-border/50 h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
              <Droplets className="h-3 w-3" /> Water (L)
            </label>
            <Input
              type="number"
              step="0.1"
              value={data.water_liters || ""}
              onChange={(e) => setData((d) => ({ ...d, water_liters: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
              className="bg-secondary/50 border-border/50 h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
              <Moon className="h-3 w-3" /> Sleep (h)
            </label>
            <Input
              type="number"
              step="0.5"
              value={data.sleep_hours || ""}
              onChange={(e) => setData((d) => ({ ...d, sleep_hours: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
              className="bg-secondary/50 border-border/50 h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
              <Flame className="h-3 w-3" /> Calories
            </label>
            <Input
              type="number"
              value={data.calories || ""}
              onChange={(e) => setData((d) => ({ ...d, calories: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="bg-secondary/50 border-border/50 h-8 text-sm"
            />
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="text-[10px] text-muted-foreground mb-2 block flex items-center gap-1">
            <Smile className="h-3 w-3" /> Mood
          </label>
          <div className="flex items-center gap-3">
            <Slider
              value={[data.mood]}
              onValueChange={([v]) => setData((d) => ({ ...d, mood: v }))}
              min={1}
              max={5}
              step={1}
              className="flex-1"
            />
            <span className="text-2xl">{moodEmojis[data.mood - 1]}</span>
          </div>
        </div>

        {/* Notes */}
        <Textarea
          value={data.notes}
          onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Notes about your day..."
          className="bg-secondary/50 border-border/50 text-sm resize-none h-16"
        />

        {/* AI Tip */}
        {aiTip && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-primary">AI Health Tip</span>
            </div>
            <p className="text-xs text-muted-foreground">{aiTip}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 gradient-primary text-primary-foreground"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <><Save className="h-4 w-4 mr-1" /> Save Today</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchAITip}
            disabled={tipLoading}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            {tipLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <><Sparkles className="h-4 w-4 mr-1" /> AI Tip</>
            )}
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}

export const HealthLogger = memo(HealthLoggerInner);
