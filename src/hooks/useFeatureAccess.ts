import { useAuth } from "@/contexts/AuthContext";
import { FEATURE_REQUIREMENTS, PlanKey } from "@/lib/stripeConfig";

export function useFeatureAccess(featureName: string) {
  const { profile, subscription } = useAuth();

  const currentPlan: PlanKey = subscription?.planKey ?? (profile?.plan_type as PlanKey) ?? "free";
  const allowedPlans = FEATURE_REQUIREMENTS[featureName];

  if (!allowedPlans) return { hasAccess: true, currentPlan, requiredPlans: [] };

  const hasAccess = allowedPlans.includes(currentPlan);

  return { hasAccess, currentPlan, requiredPlans: allowedPlans };
}
