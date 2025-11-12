import { ReactNode } from "react";
import Link from "next/link";

/**
 * Dashboard layout providing navigation and shared structure across modules.
 */
const links = [
  { href: "/dashboard/sales", label: "Sales" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/accounting", label: "Accounting" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/printers", label: "Printers" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/admin", label: "Admin" }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <aside className="flex flex-col gap-3 border-r border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-xl font-semibold text-brand">CafePOS</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link key={link.href} className="text-sm font-medium text-slate-700 hover:text-brand dark:text-slate-300" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}
