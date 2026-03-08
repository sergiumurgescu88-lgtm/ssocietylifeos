import { Heart, Footprints, Droplets, Moon, Flame, Apple } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { Progress } from "@/components/ui/progress";

const healthStats = [
  { label: "Steps", value: 6847, goal: 10000, icon: Footprints, unit: "" },
  { label: "Water", value: 1.5, goal: 2.5, icon: Droplets, unit: "L" },
  { label: "Sleep", value: 7.3, goal: 8, icon: Moon, unit: "h" },
  { label: "Calories", value: 1850, goal: 2200, icon: Flame, unit: "kcal" },
];

const meals = [
  { time: "08:00", name: "Oatmeal + Berries", calories: 320 },
  { time: "12:30", name: "Grilled Chicken Salad", calories: 480 },
  { time: "15:00", name: "Protein Bar", calories: 200 },
  { time: "19:00", name: "Salmon + Vegetables", calories: 550 },
];

const weeklyMood = ["😊", "😐", "😊", "😴", "😊", "😊", "🔥"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Health() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <span className="gradient-text">Health</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your wellness</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStats.map((stat) => (
          <WidgetCard key={stat.label} title={stat.label} icon={<stat.icon className="h-4 w-4" />}>
            <p className="text-2xl font-bold">{stat.value}<span className="text-sm text-muted-foreground ml-1">{stat.unit}</span></p>
            <Progress value={(stat.value / stat.goal) * 100} className="h-2 bg-secondary mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Goal: {stat.goal}{stat.unit}</p>
          </WidgetCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard title="Today's Meals" icon={<Apple className="h-4 w-4" />}>
          <div className="space-y-2">
            {meals.map((meal, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                </div>
                <span className="text-sm text-muted-foreground">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Weekly Mood" icon={<Heart className="h-4 w-4" />}>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2 rounded-xl bg-secondary/30 p-3">
                <span className="text-xl">{weeklyMood[i]}</span>
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
