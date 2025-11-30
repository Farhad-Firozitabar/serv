import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/ui/LogoutButton";
import SidebarNav from "@/components/dashboard/SidebarNav";

/**
 * Dashboard layout providing navigation and shared structure across modules.
 */
const userLinks = [
  { href: "/dashboard/sales", label: "فروش" },
  { href: "/dashboard/menu", label: "منو" },
  { href: "/dashboard/inventory", label: "موجودی" },
  { href: "/dashboard/accounting", label: "حسابداری" },
  { href: "/dashboard/reports", label: "گزارش‌ها" },
  { href: "/dashboard/settings", label: "تنظیمات" }
];

const adminLinks = [
  { href: "/dashboard/admin", label: "مدیریت" }
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === "admin";
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-emerald-50/70 text-slate-900 dark:bg-slate-950">
      <aside className="flex flex-col gap-6 border-l border-emerald-200 bg-gradient-to-b from-emerald-900 to-emerald-800 p-6 text-white shadow-2xl">
        <div>
          <h2 className="text-2xl font-black">سرو</h2>
          <p className="mt-1 text-sm text-emerald-100">داشبورد جامع مدیریت کافه</p>
        </div>
        <SidebarNav links={links} />
        <div className="mt-auto pt-4 border-t border-emerald-700">
          <LogoutButton />
        </div>
      </aside>
      <main className="bg-white/90 p-8 shadow-inner shadow-emerald-100">{children}</main>
    </div>
  );
}
