import { memo } from "react";
import { Crown, Sparkles, Zap, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const proFeatures = [
  { icon: Sparkles, text: "Unlimited AI queries" },
  { icon: Zap, text: "Real-time price alerts" },
  { icon: Shield, text: "Advanced portfolio analytics" },
];

function UpgradeCardInner() {
  const { profile } = useAuth();

  if (profile?.plan_type !== "free") return null;

  const handleUpgrade = () => {
    // Stripe integration placeholder
    toast.info("Stripe checkout va fi integrat aici. Coming soon!");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-[1px]">
      {/* Gold gradient border */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 opacity-60" />

      <div className="relative glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-5 w-5 text-warning" />
          <h3 className="text-sm font-bold">Upgrade to PRO</h3>
        </div>

        <div className="space-y-2 mb-4">
          {proFeatures.map((f) => (
            <div key={f.text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-success shrink-0" />
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-semibold hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
        >
          <Crown className="h-4 w-4 mr-1" />
          Get PRO — $9.99/mo
        </Button>

        <p className="text-[10px] text-muted-foreground text-center mt-2">Cancel anytime · Secure payment</p>
      </div>
    </div>
  );
}

export const UpgradeCard = memo(UpgradeCardInner);
