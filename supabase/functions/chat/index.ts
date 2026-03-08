import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, contextData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context from user's dashboard data
    let contextStr = "";
    if (contextData) {
      const parts: string[] = [];
      if (contextData.weather) {
        parts.push(`Weather: ${contextData.weather.temp}°C, ${contextData.weather.condition} in ${contextData.weather.location}`);
      }
      if (contextData.crypto) {
        const cryptoStr = contextData.crypto
          .map((c: any) => `${c.symbol}: $${c.price} (${c.change24h > 0 ? "+" : ""}${c.change24h}%)`)
          .join(", ");
        parts.push(`Crypto: ${cryptoStr}`);
      }
      if (contextData.health) {
        parts.push(`Health: ${contextData.health.steps?.current} steps, ${contextData.health.sleep?.hours}h sleep, ${contextData.health.water?.current}L water`);
      }
      if (contextData.userName) {
        parts.push(`User: ${contextData.userName}`);
      }
      if (parts.length > 0) {
        contextStr = `\n\nCurrent user data:\n${parts.join("\n")}`;
      }
    }

    const systemPrompt = `Ești LifeOS AI, un asistent personal inteligent, util și concis. Răspunzi în limba în care ți se vorbește. Poți ajuta cu: planificare task-uri, sfaturi financiare, monitorizare sănătate, productivitate, și orice altceva. Fii prietenos și folosește emoji-uri ocazional. Formatează răspunsurile cu markdown când e util.${contextStr}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Prea multe cereri. Încearcă din nou în câteva secunde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credit insuficient. Adaugă fonduri în workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Eroare AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
