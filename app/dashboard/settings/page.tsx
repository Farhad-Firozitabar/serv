import { requirePlan } from "@/lib/subscription";

/**
 * Settings dashboard for updating cafe profile and notification preferences.
 */
export default async function SettingsPage() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">Configure cafe profile details, printer defaults, and notifications.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-slate-200 p-4">
          <h2 className="text-lg font-medium">Cafe profile</h2>
          <p className="text-sm text-slate-500">Update address, hours, and contact information.</p>
        </div>
        <div className="rounded border border-slate-200 p-4">
          <h2 className="text-lg font-medium">Notifications</h2>
          <p className="text-sm text-slate-500">Control low stock alerts and accounting reminders.</p>
        </div>
      </div>
    </section>
  );
}
