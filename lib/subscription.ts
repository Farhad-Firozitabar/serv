import { SessionPayload, getSession } from "@/lib/auth";

/**
 * Subscription helpers providing plan-aware feature toggles for سرو modules.
 */
export type SubscriptionTier = SessionPayload["subscriptionTier"];

export const planFeatures: Record<SubscriptionTier, string[]> = {
  BASIC: ["مدیریت فروش", "موجودی ساده", "گزارش‌های پایه", "چاپ از مرورگر"],
  PROFESSIONAL: [
    "مدیریت فروش",
    "موجودی پیشرفته",
    "حسابداری",
    "باشگاه مشتریان",
    "تحلیل داده",
    "پشتیبان‌گیری خودکار",
    "چاپ IPP",
    "پشتیبانی ایمیلی"
  ]
};

export async function requirePlan(required: SubscriptionTier | SubscriptionTier[]) {
  const session = await getSession();
  if (!session) {
    return { authorized: false, reason: "جلسه کاربری فعال نیست" } as const;
  }

  const allowedPlans = Array.isArray(required) ? required : [required];
  if (!allowedPlans.includes(session.subscriptionTier)) {
    return { authorized: false, reason: "پلن فعلی شما اجازه دسترسی به این بخش را نمی‌دهد" } as const;
  }

  return { authorized: true, session } as const;
}
