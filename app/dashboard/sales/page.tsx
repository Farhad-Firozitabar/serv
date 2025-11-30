import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import SalesFormWrapper from "@/components/sales/SalesFormWrapper";
import SalesHistoryWrapper from "@/components/sales/SalesHistoryWrapper";

/**
 * Sales dashboard with form and history for the authenticated user.
 */
export default async function SalesPage() {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const sales = await prisma.sale.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    }
  });

  // Serialize Decimal values to numbers for client components
  const serializedSales = sales.map((sale) => ({
    ...sale,
    total: Number(sale.total),
    tax: Number(sale.tax),
    items: sale.items.map((item) => ({
      ...item,
      price: Number(item.price),
      menuItem: item.menuItem ? {
        ...item.menuItem,
        price: Number(item.menuItem.price),
        cost: item.menuItem.cost ? Number(item.menuItem.cost) : null
      } : null
    }))
  }));

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">فروش</h1>
        <p className="text-sm text-slate-500">ثبت فروش جدید و مشاهده تاریخچه تراکنش‌ها</p>
      </header>

      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">فروش جدید</h2>
          <SalesFormWrapper initialSales={serializedSales} />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">تاریخچه فروش‌ها</h2>
          <SalesHistoryWrapper initialSales={serializedSales} />
        </div>
      </div>
    </section>
  );
}
