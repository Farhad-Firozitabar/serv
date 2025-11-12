import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * Reports dashboard visualising sales metrics using Recharts.
 */
const AreaChart = dynamic(() => import("@/components/charts/SalesAreaChart"), { ssr: false });

export default async function ReportsPage() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  const sales = await prisma.sale.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" }
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="text-sm text-slate-500">Visualise your performance across selected periods.</p>
      </header>
      <div className="rounded border border-slate-200 p-4 shadow-sm">
        <AreaChart sales={sales} />
      </div>
    </section>
  );
}
