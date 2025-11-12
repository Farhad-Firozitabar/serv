import { requirePlan } from "@/lib/subscription";

/**
 * Accounting dashboard placeholder for ledger, profit/loss, and expenses.
 */
export default async function AccountingPage() {
  const { authorized, session, reason } = await requirePlan("PROFESSIONAL");
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Accounting</h1>
        <p className="text-sm text-slate-500">Access ledger entries, profit &amp; loss, and expense tracking.</p>
      </header>
      <div className="rounded border border-slate-200 p-6 text-sm text-slate-600">
        <p>
          Professional plan subscribers can manage ledger entries, reconcile expenses, and track profitability here. Integrate
          with external accounting software or export PDF statements.
        </p>
      </div>
    </section>
  );
}
