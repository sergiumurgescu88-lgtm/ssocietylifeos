import { useState } from "react";
import { Crown, Check, X, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, PlanKey } from "@/lib/stripeConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const planIcons: Record<PlanKey, typeof Crown> = {
  free: Zap,
  pro: Sparkles,
  family: Users,
};

const testimonials = [
  { name: "Alex M.", role: "Freelancer", text: "LifeOS Pro changed how I manage my day. The AI insights are incredibly useful!" },
  { name: "Maria D.", role: "Product Manager", text: "The family plan is perfect — everyone stays synced and organized." },
  { name: "Andrei R.", role: "Developer", text: "Worth every penny. The portfolio analytics alone saved me hours." },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { subscription, profile } = useAuth();

  const currentPlan: PlanKey = subscription?.planKey ?? (profile?.plan_type as PlanKey) ?? "free";

  const handleCheckout = async (planKey: PlanKey) => {
    if (planKey === "free") return;
    const plan = PLANS[planKey];
    if (!("monthlyPriceId" in plan)) return;

    const priceId = yearly ? plan.yearlyPriceId : plan.monthlyPriceId;
    setLoading(planKey);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">
          Choose Your <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Unlock the full power of LifeOS AI with premium features
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-sm ${!yearly ? "font-semibold text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={yearly} onCheckedChange={setYearly} />
          <span className={`text-sm ${yearly ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
            Yearly <span className="text-xs text-success font-medium">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(([key, plan], i) => {
          const isPopular = key === "pro";
          const isCurrent = key === currentPlan;
          const Icon = planIcons[key];
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const period = yearly ? "/yr" : "/mo";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-[1px] ${
                isPopular
                  ? "bg-gradient-to-br from-primary via-accent to-primary"
                  : "bg-border/50"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`rounded-2xl p-6 h-full flex flex-col ${
                isPopular ? "bg-background" : "bg-card"
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${isPopular ? "bg-primary/10" : "bg-secondary"}`}>
                    <Icon className={`h-5 w-5 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold">${price === 0 ? "0" : price.toFixed(2)}</span>
                  {price > 0 && <span className="text-muted-foreground text-sm">{period}</span>}
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/60"}>{f.text}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    <Check className="h-4 w-4 mr-1" /> Current Plan
                  </Button>
                ) : key === "free" ? (
                  <Button disabled variant="outline" className="w-full">
                    Free Forever
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCheckout(key)}
                    disabled={loading === key}
                    className={`w-full font-semibold ${
                      isPopular
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                        : ""
                    }`}
                    variant={isPopular ? "default" : "outline"}
                  >
                    {loading === key ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-1" />
                        Get {plan.name}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Testimonials */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-center">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-xl p-5 space-y-3">
              <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
