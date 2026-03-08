import {
  Cloud,
  Sun,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Zap,
  Bitcoin,
} from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const weatherMock = { temp: 22, condition: "Partly Cloudy", location: "Bucharest" };
const cryptoMock = {
  BTC: { price: 67234, change24h: 2.3 },
  ETH: { price: 3421, change24h: -1.1 },
};
const tasksMock = [
  { id: 1, title: "Review AI strategy doc", done: false },
  { id: 2, title: "Morning workout", done: true },
  { id: 3, title: "Team standup at 10 AM", done: false },
  { id: 4, title: "Update portfolio tracker", done: false },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          Good morning, <span className="gradient-text">{user?.name}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your daily overview</p>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Weather */}
        <WidgetCard title="Weather" icon={<Cloud className="h-4 w-4" />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{weatherMock.temp}°C</p>
              <p className="text-sm text-muted-foreground">{weatherMock.condition}</p>
            </div>
            <Sun className="h-10 w-10 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">📍 {weatherMock.location}</p>
        </WidgetCard>

        {/* AI Usage */}
        <WidgetCard title="AI Queries" icon={<Sparkles className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">{user?.aiQueriesUsed}/{user?.aiQueriesLimit}</span>
            </div>
            <Progress
              value={((user?.aiQueriesUsed ?? 0) / (user?.aiQueriesLimit ?? 1)) * 100}
              className="h-2 bg-secondary"
            />
            <p className="text-xs text-muted-foreground">
              {(user?.aiQueriesLimit ?? 0) - (user?.aiQueriesUsed ?? 0)} queries remaining
            </p>
          </div>
        </WidgetCard>

        {/* Crypto */}
        <WidgetCard title="Crypto" icon={<Bitcoin className="h-4 w-4" />}>
          <div className="space-y-3">
            {Object.entries(cryptoMock).map(([symbol, data]) => (
              <div key={symbol} className="flex items-center justify-between">
                <span className="text-sm font-medium">{symbol}</span>
                <div className="text-right">
                  <p className="text-sm font-semibold">${data.price.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-xs ${data.change24h > 0 ? "text-success" : "text-destructive"}`}>
                    {data.change24h > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {data.change24h > 0 ? "+" : ""}{data.change24h}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Quick Stats */}
        <WidgetCard title="Today's Focus" icon={<Zap className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold gradient-text">4</p>
              <p className="text-[10px] text-muted-foreground">Tasks</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold gradient-text">2</p>
              <p className="text-[10px] text-muted-foreground">Meetings</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold gradient-text">87</p>
              <p className="text-[10px] text-muted-foreground">Focus %</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold gradient-text">3h</p>
              <p className="text-[10px] text-muted-foreground">Deep Work</p>
            </div>
          </div>
        </WidgetCard>

        {/* Tasks */}
        <WidgetCard title="Tasks" icon={<Calendar className="h-4 w-4" />} colSpan={2}>
          <div className="space-y-2">
            {tasksMock.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  task.done ? "bg-secondary/30" : "bg-secondary/50 hover:bg-card-hover"
                }`}
              >
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    task.done ? "border-success bg-success" : "border-muted-foreground/30"
                  }`}
                >
                  {task.done && <span className="text-[8px] text-success-foreground">✓</span>}
                </div>
                <span className={task.done ? "text-muted-foreground line-through" : ""}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Health Quick */}
        <WidgetCard title="Health" icon={<Activity className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Steps</span>
              <span className="font-medium">6,847 / 10,000</span>
            </div>
            <Progress value={68} className="h-2 bg-secondary" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Water</span>
              <span className="font-medium">1.5L / 2.5L</span>
            </div>
            <Progress value={60} className="h-2 bg-secondary" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sleep</span>
              <span className="font-medium">7h 20m</span>
            </div>
            <Progress value={91} className="h-2 bg-secondary" />
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
