import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { healthData, userName } = await req.json();

    const prompt = `Based on the following health data for ${userName || "this user"}, provide ONE short, actionable health tip (max 2 sentences). Be encouraging and specific.

Health data:
- Steps today: ${healthData.steps || 0} (goal: 10,000)
- Water intake: ${healthData.water || 0}L (goal: 2.5L)
- Sleep last night: ${healthData.sleep || 0}h (goal: 8h)
- Mood: ${healthData.mood || 3}/5
- Calories: ${healthData.calories || 0} kcal

Give practical advice based on what needs improvement. Use an emoji. Respond in the same language the user's name suggests (Romanian if unclear).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a friendly health coach. Keep tips short, practical, and encouraging." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ tip: "💧 Nu uita să bei suficientă apă astăzi! Setează un reminder pe telefon." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const tip = data.choices?.[0]?.message?.content || "🏃 Încearcă să faci o plimbare de 15 minute azi!";

    return new Response(JSON.stringify({ tip }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("health-insight error:", e);
    return new Response(JSON.stringify({ tip: "🌟 Fiecare pas contează! Continuă să îți monitorizezi sănătatea." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
