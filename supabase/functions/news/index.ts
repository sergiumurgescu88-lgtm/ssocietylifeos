import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Comprehensive mock news data
function getMockNews(category: string) {
  const allNews: Record<string, any[]> = {
    technology: [
      { title: "AI Revolution: New Models Surpass Human Performance in Complex Reasoning", source: { name: "TechCrunch" }, publishedAt: new Date(Date.now() - 2*3600000).toISOString(), urlToImage: null, url: "#", description: "Latest AI developments show unprecedented capabilities in multi-step reasoning tasks." },
      { title: "Apple Unveils Revolutionary Mixed Reality Headset at Spring Event", source: { name: "The Verge" }, publishedAt: new Date(Date.now() - 5*3600000).toISOString(), urlToImage: null, url: "#", description: "Apple's new device blends AR and VR seamlessly." },
      { title: "Quantum Computing Breakthrough: 1000-Qubit Processor Achieved", source: { name: "Wired" }, publishedAt: new Date(Date.now() - 8*3600000).toISOString(), urlToImage: null, url: "#", description: "IBM demonstrates stable quantum processor with record qubit count." },
      { title: "Tesla's Optimus Robot Now Available for Pre-Order at $20,000", source: { name: "Ars Technica" }, publishedAt: new Date(Date.now() - 12*3600000).toISOString(), urlToImage: null, url: "#", description: "Humanoid robot designed for household tasks enters consumer market." },
      { title: "SpaceX Starship Successfully Completes First Mars Cargo Mission", source: { name: "Space.com" }, publishedAt: new Date(Date.now() - 18*3600000).toISOString(), urlToImage: null, url: "#", description: "Historic mission delivers supplies for future Mars colonization." },
    ],
    health: [
      { title: "Breakthrough mRNA Vaccine Shows 95% Efficacy Against Multiple Cancer Types", source: { name: "Nature" }, publishedAt: new Date(Date.now() - 3*3600000).toISOString(), urlToImage: null, url: "#", description: "Personalized cancer vaccines enter Phase 3 clinical trials." },
      { title: "WHO: Global Life Expectancy Reaches All-Time High of 76.4 Years", source: { name: "Reuters Health" }, publishedAt: new Date(Date.now() - 7*3600000).toISOString(), urlToImage: null, url: "#", description: "Improvements in healthcare access drive longevity gains worldwide." },
      { title: "Study: Mediterranean Diet Reduces Cognitive Decline Risk by 40%", source: { name: "BMJ" }, publishedAt: new Date(Date.now() - 10*3600000).toISOString(), urlToImage: null, url: "#", description: "Large-scale study confirms neuroprotective benefits of diet." },
      { title: "Digital Health Apps Now Prescribed by 60% of European Doctors", source: { name: "Health Tech" }, publishedAt: new Date(Date.now() - 15*3600000).toISOString(), urlToImage: null, url: "#", description: "Digital therapeutics gain mainstream medical acceptance." },
    ],
    business: [
      { title: "Bitcoin ETF Inflows Reach Record $1.2B as Institutional Interest Surges", source: { name: "CoinDesk" }, publishedAt: new Date(Date.now() - 4*3600000).toISOString(), urlToImage: null, url: "#", description: "Institutional investors continue to pour money into crypto funds." },
      { title: "Remote Work Study: 73% of Companies Plan Permanent Hybrid Models", source: { name: "Bloomberg" }, publishedAt: new Date(Date.now() - 6*3600000).toISOString(), urlToImage: null, url: "#", description: "The future of work is settling into a hybrid pattern." },
      { title: "EU Passes Landmark AI Regulation Act with Global Implications", source: { name: "Financial Times" }, publishedAt: new Date(Date.now() - 11*3600000).toISOString(), urlToImage: null, url: "#", description: "New rules set precedent for AI governance worldwide." },
      { title: "Global Renewable Energy Investment Hits $500B Record in Q1 2026", source: { name: "CNBC" }, publishedAt: new Date(Date.now() - 16*3600000).toISOString(), urlToImage: null, url: "#", description: "Clean energy transition accelerates beyond expectations." },
    ],
    general: [
      { title: "UN Climate Summit Achieves Historic Agreement on Carbon Markets", source: { name: "BBC" }, publishedAt: new Date(Date.now() - 1*3600000).toISOString(), urlToImage: null, url: "#", description: "195 nations agree on unified carbon trading framework." },
      { title: "World's Largest Coral Reef Restoration Project Launches in Australia", source: { name: "National Geographic" }, publishedAt: new Date(Date.now() - 9*3600000).toISOString(), urlToImage: null, url: "#", description: "$2B project aims to restore 500km of Great Barrier Reef." },
      { title: "International Space Station Successor 'Orbital Reef' Construction Begins", source: { name: "CNN" }, publishedAt: new Date(Date.now() - 14*3600000).toISOString(), urlToImage: null, url: "#", description: "Commercial space station will replace aging ISS by 2030." },
      { title: "Global Education Access Report Shows Record University Enrollment", source: { name: "UNESCO" }, publishedAt: new Date(Date.now() - 20*3600000).toISOString(), urlToImage: null, url: "#", description: "Online learning platforms drive unprecedented access to higher education." },
    ],
  };

  return { articles: allNews[category] || allNews.general, mock: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "general";

    const apiKey = Deno.env.get("NEWS_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify(getMockNews(category)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(category)}&language=en&pageSize=10&apiKey=${apiKey}`
    );

    if (!resp.ok) {
      console.error("NewsAPI error:", resp.status);
      return new Response(JSON.stringify(getMockNews(category)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ articles: data.articles, mock: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("news error:", e);
    return new Response(JSON.stringify(getMockNews("general")), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
