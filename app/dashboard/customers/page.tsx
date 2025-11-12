import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * Customers dashboard enabling loyalty tracking and contact management.
 */
export default async function CustomersPage() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="text-sm text-slate-500">Reward loyalty, track contact details, and manage offers.</p>
      </header>
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="text-left text-sm font-semibold">
            <th className="py-2">Name</th>
            <th className="py-2">Phone</th>
            <th className="py-2">Points</th>
            <th className="py-2">Member since</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="py-2 font-medium">{customer.name}</td>
              <td className="py-2">{customer.phone ?? "—"}</td>
              <td className="py-2">{customer.points}</td>
              <td className="py-2">{new Date(customer.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
