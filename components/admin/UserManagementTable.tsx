"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import PlanSelector from "@/components/forms/PlanSelector";

/**
 * Client-side admin table enabling subscription plan updates.
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  subscriptionTier: "BASIC" | "PROFESSIONAL";
}

export default function UserManagementTable({ users }: { users: AdminUser[] }) {
  const [pending, startTransition] = useTransition();
  const [localUsers, setLocalUsers] = useState(users);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      {localUsers.map((user) => (
        <div
          key={user.id}
          className="flex flex-col gap-4 rounded border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <div className="flex flex-1 items-center gap-4">
            <PlanSelector value={user.subscriptionTier} onChange={(tier) => selectPlan(user.id, tier)} />
            <Button
              type="button"
              variant="primary"
              disabled={pending && savingUserId === user.id}
              onClick={() => savePlan(user.id)}
            >
              {pending && savingUserId === user.id ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
