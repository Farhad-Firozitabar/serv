import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import InventoryList from "@/components/inventory/InventoryList";
import Link from "next/link";

/**
 * Inventory dashboard showing current stock levels and recent adjustments.
 */
export default async function InventoryPage() {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const products = await prisma.product.findMany({
    where: { userId: session.userId },
    include: { logs: { take: 3, orderBy: { createdAt: "desc" } } },
    orderBy: { name: "asc" }
  });

  return (
    <section className="space-y-6 text-right">
      <header className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">انبار مواد اولیه</h1>
          <p className="text-sm text-slate-500">مشاهده موجودی لحظه‌ای، تاریخ انقضا، تاریخچه ورود و خروج و یادداشت‌های انبارداری.</p>
        </div>
        <Link 
          href="/dashboard/inventory/new"
          className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
        >
          افزودن ماده اولیه جدید
        </Link>
      </header>
      <InventoryList products={products} />
    </section>
  );
}
