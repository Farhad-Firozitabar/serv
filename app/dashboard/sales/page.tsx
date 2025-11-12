import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * Sales dashboard listing recent transactions for the authenticated user.
 */
export default async function SalesPage() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  const sales = await prisma.sale.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { items: true }
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Recent sales</h1>
        <p className="text-sm text-slate-500">Track your latest CafePOS transactions.</p>
      </header>
      <div className="grid gap-4">
        {sales.map((sale) => (
          <article key={sale.id} className="rounded border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-medium">Sale #{sale.id.slice(0, 8)}</h2>
            <p className="text-sm text-slate-500">Total: ${Number(sale.total).toFixed(2)}</p>
            <ul className="mt-2 text-sm text-slate-600">
              {sale.items.map((item) => (
                <li key={item.id}>
                  {item.qty} × {item.productId.slice(0, 6)} — ${Number(item.price).toFixed(2)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
