"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

interface SidebarNavProps {
  links: NavLink[];
}

export default function SidebarNav({ links }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white/20 text-white shadow-lg shadow-emerald-900/30"
                : "text-emerald-50 hover:bg-white/15"
            }`}
            href={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

