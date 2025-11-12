import { SessionPayload, getSession } from "@/lib/auth";

/**
 * Subscription helpers providing plan-aware feature toggles for CafePOS modules.
 */
export type SubscriptionTier = SessionPayload["subscriptionTier"];

export const planFeatures: Record<SubscriptionTier, string[]> = {
  BASIC: [
    "Sales management",
    "Simple inventory",
    "Basic reports",
    "Browser printing"
  ],
  PROFESSIONAL: [
    "Sales management",
    "Advanced inventory",
    "Accounting",
    "Customer loyalty",
    "Analytics",
    "Automatic backup",
    "IPP printing",
    "Email support"
  ]
};

export async function requirePlan(required: SubscriptionTier | SubscriptionTier[]) {
  const session = await getSession();
  if (!session) {
    return { authorized: false, reason: "No active session" } as const;
  }

  const allowedPlans = Array.isArray(required) ? required : [required];
  if (!allowedPlans.includes(session.subscriptionTier)) {
    return { authorized: false, reason: "Insufficient plan" } as const;
  }

  return { authorized: true, session } as const;
}
