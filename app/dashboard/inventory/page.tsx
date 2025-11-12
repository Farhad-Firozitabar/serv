import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * Inventory dashboard showing current stock levels and recent adjustments.
 */
export default async function InventoryPage() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  const products = await prisma.product.findMany({ include: { logs: { take: 3, orderBy: { createdAt: "desc" } } } });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Inventory</h1>
        <p className="text-sm text-slate-500">Monitor stock, expirations, and reorder levels.</p>
      </header>
      <div className="grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="rounded border border-slate-200 p-4">
            <h2 className="text-lg font-medium">{product.name}</h2>
            <p className="text-sm text-slate-500">In stock: {product.stock}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {product.logs.map((log) => (
                <li key={log.id}>
                  {log.change > 0 ? "+" : ""}
                  {log.change} — {log.reason}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
