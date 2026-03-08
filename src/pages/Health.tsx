import { useState } from "react";
import { Heart } from "lucide-react";
import { WeatherDetailed } from "@/components/health/WeatherDetailed";
import { HealthLogger } from "@/components/health/HealthLogger";
import { HealthStats } from "@/components/health/HealthStats";

export default function Health() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <span className="gradient-text">Health & Wellness</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track your health, check the weather</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weather - 1 col */}
        <WeatherDetailed />

        {/* Health Logger - 2 cols */}
        <div className="lg:col-span-2">
          <HealthLogger onSaved={() => setRefreshKey((k) => k + 1)} />
        </div>
      </div>

      {/* Health History */}
      <HealthStats refreshKey={refreshKey} />
    </div>
  );
}
