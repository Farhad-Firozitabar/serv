import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import UserManagementTable from "@/components/admin/UserManagementTable";

/**
 * Admin user management page enabling plan upgrades and deactivations.
 */
export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return <p className="text-red-500">Access denied: admin privileges required.</p>;
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Manage users</h1>
        <p className="text-sm text-slate-500">Assign subscription plans and deactivate accounts.</p>
      </header>
      <UserManagementTable users={users} />
    </section>
  );
}
