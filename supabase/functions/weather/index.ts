import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mock weather data for when no API key or rate limited
function getMockWeather(lat: number, lon: number) {
  return {
    current: {
      temp: 18 + Math.round(Math.random() * 10),
      feels_like: 16 + Math.round(Math.random() * 10),
      humidity: 55 + Math.round(Math.random() * 25),
      wind_speed: 5 + Math.round(Math.random() * 15),
      weather: [{ main: "Clouds", description: "partly cloudy", icon: "02d" }],
      uvi: 3 + Math.round(Math.random() * 5),
    },
    daily: Array.from({ length: 5 }, (_, i) => ({
      dt: Math.floor(Date.now() / 1000) + i * 86400,
      temp: { min: 12 + Math.round(Math.random() * 5), max: 20 + Math.round(Math.random() * 8) },
      weather: [{ main: ["Clear", "Clouds", "Rain", "Clear", "Clouds"][i], description: ["clear sky", "scattered clouds", "light rain", "clear sky", "overcast"][i], icon: ["01d", "03d", "10d", "01d", "04d"][i] }],
      pop: Math.round(Math.random() * 60) / 100,
    })),
    alerts: [],
    mock: true,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat") || "44.4268";
    const lon = url.searchParams.get("lon") || "26.1025";

    // Try OpenWeatherMap free One Call API 3.0 or fallback
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");

    if (!apiKey) {
      // Return mock data if no API key configured
      console.log("No OPENWEATHER_API_KEY, returning mock weather");
      return new Response(JSON.stringify(getMockWeather(parseFloat(lat), parseFloat(lon))), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use free 2.5 API for current + 5-day forecast
    const [currentResp, forecastResp] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${apiKey}`),
    ]);

    if (!currentResp.ok || !forecastResp.ok) {
      console.error("OpenWeather error:", currentResp.status, forecastResp.status);
      return new Response(JSON.stringify(getMockWeather(parseFloat(lat), parseFloat(lon))), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const current = await currentResp.json();
    const forecast = await forecastResp.json();

    // Transform to unified format
    const dailyMap = new Map<string, any>();
    for (const item of forecast.list) {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: item.dt,
          temp: { min: item.main.temp_min, max: item.main.temp_max },
          weather: item.weather,
          pop: item.pop || 0,
        });
      } else {
        const existing = dailyMap.get(date);
        existing.temp.min = Math.min(existing.temp.min, item.main.temp_min);
        existing.temp.max = Math.max(existing.temp.max, item.main.temp_max);
      }
    }

    const result = {
      current: {
        temp: Math.round(current.main.temp),
        feels_like: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        wind_speed: Math.round(current.wind?.speed || 0),
        weather: current.weather,
        uvi: 0,
      },
      daily: Array.from(dailyMap.values()).slice(0, 5),
      alerts: [],
      location: current.name,
      mock: false,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather error:", e);
    return new Response(JSON.stringify(getMockWeather(44.43, 26.10)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
