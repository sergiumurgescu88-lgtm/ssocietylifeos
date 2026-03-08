import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const today = new Date().toISOString().split("T")[0];

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, ai_queries_used, plan_type");

    if (profilesError) throw profilesError;

    const summaries = [];

    for (const profile of profiles || []) {
      // Get today's health log
      const { data: healthLog } = await supabase
        .from("health_logs")
        .select("*")
        .eq("user_id", profile.user_id)
        .eq("log_date", today)
        .maybeSingle();

      // Get today's usage
      const { data: usageLogs } = await supabase
        .from("usage_logs")
        .select("api_calls_count, module_accessed")
        .eq("user_id", profile.user_id)
        .eq("log_date", today);

      const totalApiCalls = (usageLogs || []).reduce((sum, l) => sum + l.api_calls_count, 0);
      const modulesUsed = [...new Set((usageLogs || []).map((l) => l.module_accessed))];

      summaries.push({
        user_id: profile.user_id,
        name: profile.full_name || "User",
        plan: profile.plan_type,
        ai_queries_today: profile.ai_queries_used,
        health: healthLog
          ? {
              steps: healthLog.steps,
              water: healthLog.water_liters,
              sleep: healthLog.sleep_hours,
              mood: healthLog.mood,
            }
          : null,
        api_calls_today: totalApiCalls,
        modules_used: modulesUsed,
      });
    }

    console.log(`[DAILY-SUMMARY] Generated summaries for ${summaries.length} users`);

    return new Response(
      JSON.stringify({ date: today, users: summaries.length, summaries }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[DAILY-SUMMARY] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
