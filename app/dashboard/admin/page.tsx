import Link from "next/link";
import { getSession } from "@/lib/auth";

/**
 * Admin dashboard landing page summarising management actions.
 */
export default async function AdminHomePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return <p className="text-red-500">Access denied: admin privileges required.</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Admin console</h1>
        <p className="text-sm text-slate-500">Manage users, plans, and global CafePOS settings.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          className="rounded border border-slate-200 p-4 transition hover:border-brand"
          href="/dashboard/admin/users"
        >
          <h2 className="text-lg font-medium">User management</h2>
          <p className="text-sm text-slate-500">Review, upgrade, or deactivate cafe accounts.</p>
        </Link>
        <article className="rounded border border-slate-200 p-4">
          <h2 className="text-lg font-medium">System settings</h2>
          <p className="text-sm text-slate-500">Configure billing, email support, and backup policies.</p>
        </article>
      </div>
    </section>
  );
}
