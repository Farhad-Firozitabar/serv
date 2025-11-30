import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import ProfileForm from "@/components/settings/ProfileForm";

/**
 * Settings dashboard for updating cafe profile and notification preferences.
 */
export default async function SettingsPage() {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">تنظیمات سرو</h1>
        <p className="text-sm text-slate-500">اطلاعات کافه، پرینتر پیش‌فرض و هشدارهای سیستمی را از این بخش تنظیم کنید.</p>
      </header>
      <div className="grid gap-4">
        <ProfileForm />
      </div>
    </section>
  );
}
