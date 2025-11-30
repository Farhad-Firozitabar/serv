"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Logout button component that clears session and redirects to login.
 */
export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-white/15 disabled:opacity-50"
    >
      {pending ? "در حال خروج..." : "خروج"}
    </button>
  );
}

