import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";

/**
 * Customers dashboard enabling loyalty tracking and contact management.
 */
export default async function CustomersPage() {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">باشگاه مشتریان</h1>
        <p className="text-sm text-slate-500">جزئیات تماس، امتیاز وفاداری و تاریخ شروع همکاری هر مشتری را مشاهده کنید.</p>
      </header>
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm shadow-emerald-50">
        <table className="min-w-full divide-y divide-emerald-50 text-right">
          <thead className="bg-emerald-50/60 text-sm font-semibold text-emerald-900">
            <tr>
              <th className="px-4 py-3">نام</th>
              <th className="px-4 py-3">تلفن</th>
              <th className="px-4 py-3">امتیاز</th>
              <th className="px-4 py-3">تاریخ عضویت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{customer.name}</td>
                <td className="px-4 py-3">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3">{customer.points}</td>
                <td className="px-4 py-3">{new Date(customer.createdAt).toLocaleDateString("fa-IR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
