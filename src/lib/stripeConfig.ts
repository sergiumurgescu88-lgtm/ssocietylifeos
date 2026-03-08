export const PLANS = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "50 AI queries / month", included: true },
      { text: "3 core modules", included: true },
      { text: "Basic weather & news", included: true },
      { text: "Unlimited AI queries", included: false },
      { text: "Advanced portfolio analytics", included: false },
      { text: "Priority support", included: false },
      { text: "Family sharing (5 users)", included: false },
      { text: "Shared budget tracking", included: false },
    ],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 14.99,
    yearlyPrice: 143.89,
    monthlyPriceId: "price_1T8nIMLDo9sXtuKJQdy2ldbY",
    yearlyPriceId: "price_1T8nJKLDo9sXtuKJTn1u1Pz4",
    productId: "prod_U71LLB1DURcMix",
    features: [
      { text: "50 AI queries / month", included: true },
      { text: "3 core modules", included: true },
      { text: "Basic weather & news", included: true },
      { text: "Unlimited AI queries", included: true },
      { text: "Advanced portfolio analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Family sharing (5 users)", included: false },
      { text: "Shared budget tracking", included: false },
    ],
  },
  family: {
    name: "Family",
    monthlyPrice: 29.99,
    yearlyPrice: 287.89,
    monthlyPriceId: "price_1T8nKrLDo9sXtuKJM7CvpEc5",
    yearlyPriceId: "price_1T8nLCLDo9sXtuKJ4xjJGEEh",
    productId: "prod_U71NIk3Grs6xo9",
    features: [
      { text: "50 AI queries / month", included: true },
      { text: "3 core modules", included: true },
      { text: "Basic weather & news", included: true },
      { text: "Unlimited AI queries", included: true },
      { text: "Advanced portfolio analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Family sharing (5 users)", included: true },
      { text: "Shared budget tracking", included: true },
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Map Stripe product IDs to plan keys
export const PRODUCT_TO_PLAN: Record<string, PlanKey> = {
  prod_U71LLB1DURcMix: "pro",
  prod_U71Mq0WuZao2jL: "pro",
  prod_U71NIk3Grs6xo9: "family",
  prod_U71Nm0oMIasMUy: "family",
};

// Features that require specific plans
export const FEATURE_REQUIREMENTS: Record<string, PlanKey[]> = {
  "unlimited-ai": ["pro", "family"],
  "portfolio-analytics": ["pro", "family"],
  "priority-support": ["pro", "family"],
  "family-sharing": ["family"],
  "shared-budget": ["family"],
  "price-alerts": ["pro", "family"],
  "csv-export": ["pro", "family"],
};
