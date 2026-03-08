import { Crown, Star, Zap } from "lucide-react";

const planConfig = {
  free: { label: "Free", icon: Zap, className: "bg-secondary text-secondary-foreground" },
  pro: { label: "PRO", icon: Star, className: "gradient-primary text-primary-foreground" },
  enterprise: { label: "Enterprise", icon: Crown, className: "bg-foreground text-background" },
};

export function SubscriptionBadge({ plan }: { plan: string }) {
  const config = planConfig[plan as keyof typeof planConfig] || planConfig.free;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
