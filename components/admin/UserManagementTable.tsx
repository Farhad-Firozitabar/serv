"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import PlanSelector from "@/components/forms/PlanSelector";

/**
 * Client-side admin table enabling subscription plan updates and user activation.
 */
export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  subscriptionTier: "BASIC" | "PROFESSIONAL";
  active: boolean;
  hasOnlineMenu: boolean;
  role: "admin" | "user";
}

export default function UserManagementTable({ users }: { users: AdminUser[] }) {
  const [pending, startTransition] = useTransition();
  const [localUsers, setLocalUsers] = useState(users);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);
  const [togglingOnlineMenuUserId, setTogglingOnlineMenuUserId] = useState<string | null>(null);

  const selectPlan = (userId: string, subscriptionTier: "BASIC" | "PROFESSIONAL") => {
    setLocalUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, subscriptionTier } : user))
    );
  };

  const savePlan = (userId: string) => {
    const user = localUsers.find((entry) => entry.id === userId);
    if (!user) return;
    setSavingUserId(userId);
    startTransition(async () => {
      await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscriptionTier: user.subscriptionTier })
      });
      setSavingUserId(null);
    });
  };

  const toggleActive = (userId: string) => {
    const user = localUsers.find((entry) => entry.id === userId);
    if (!user || user.role === "admin") return; // Don't allow deactivating admin
    
    setActivatingUserId(userId);
    startTransition(async () => {
      const res = await fetch("/api/admin/users/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, active: !user.active })
      });
      
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
        );
      }
      setActivatingUserId(null);
    });
  };

  const toggleOnlineMenu = (userId: string) => {
    const user = localUsers.find((entry) => entry.id === userId);
    if (!user) return;
    
    setTogglingOnlineMenuUserId(userId);
    startTransition(async () => {
      const res = await fetch("/api/admin/users/update-online-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, hasOnlineMenu: !user.hasOnlineMenu })
      });
      
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, hasOnlineMenu: !u.hasOnlineMenu } : u))
        );
      }
      setTogglingOnlineMenuUserId(null);
    });
  };

  return (
    <div className="space-y-4">
      {localUsers.map((user) => (
        <div
          key={user.id}
          className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 text-right shadow-sm shadow-emerald-50 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              {user.role === "admin" && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">مدیر</span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  user.active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.active ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <p className="text-sm text-slate-500">{user.phone}</p>
          </div>
          <div className="flex flex-1 flex-col items-stretch gap-4 md:flex-row md:items-center">
            <PlanSelector value={user.subscriptionTier} onChange={(tier) => selectPlan(user.id, tier)} readOnly={pending} />
            <Button
              type="button"
              variant={user.hasOnlineMenu ? "primary" : "secondary"}
              disabled={pending && togglingOnlineMenuUserId === user.id}
              onClick={() => toggleOnlineMenu(user.id)}
              className="whitespace-nowrap"
            >
              {pending && togglingOnlineMenuUserId === user.id
                ? "در حال تغییر..."
                : user.hasOnlineMenu
                ? "منو آنلاین: فعال"
                : "منو آنلاین: غیرفعال"}
            </Button>
            {user.role !== "admin" && (
              <Button
                type="button"
                variant={user.active ? "secondary" : "primary"}
                disabled={(pending && activatingUserId === user.id) || (pending && savingUserId === user.id)}
                onClick={() => toggleActive(user.id)}
              >
                {pending && activatingUserId === user.id
                  ? "در حال تغییر..."
                  : user.active
                  ? "غیرفعال کردن"
                  : "فعال کردن"}
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              disabled={pending && savingUserId === user.id}
              onClick={() => savePlan(user.id)}
            >
              {pending && savingUserId === user.id ? "در حال ذخیره..." : "ذخیره پلن"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
