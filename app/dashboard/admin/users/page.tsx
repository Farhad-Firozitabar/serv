import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import UserManagementTable from "@/components/admin/UserManagementTable";

/**
 * Admin user management page enabling plan upgrades and deactivations.
 */
export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
        دسترسی نامعتبر: فقط مدیران به این بخش دسترسی دارند.
      </p>
    );
  }

  const users = await prisma.user.findMany({ 
    where: { role: "user" }, // Only show regular users, not admins
    orderBy: { createdAt: "desc" } 
  });

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">مدیریت کاربران</h1>
        <p className="text-sm text-slate-500">پلن اشتراک کاربران را تعیین و وضعیت حساب‌ها را کنترل کنید.</p>
      </header>
      <UserManagementTable users={users} />
    </section>
  );
}
