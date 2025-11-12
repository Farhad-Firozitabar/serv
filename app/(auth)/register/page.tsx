"use client";

import { useState } from "react";
import Link from "next/link";
import PlanSelector from "@/components/forms/PlanSelector";

/**
 * Registration page onboarding new cafe users with plan selection metadata.
 */
export default function RegisterPage() {
  const [plan, setPlan] = useState<"BASIC" | "PROFESSIONAL">("BASIC");

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-8">
      <h2 className="text-3xl font-semibold text-brand">Create your CafePOS account</h2>
      <form className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input id="name" className="rounded border border-slate-300 p-2" placeholder="Avery Barista" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input id="email" className="rounded border border-slate-300 p-2" placeholder="you@cafe.com" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input id="password" type="password" className="rounded border border-slate-300 p-2" placeholder="••••••••" />
        </div>
        <PlanSelector value={plan} onChange={setPlan} />
        <button type="submit" className="rounded bg-brand px-4 py-2 font-semibold text-white">
          Create account
        </button>
      </form>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Already registered? {" "}
        <Link className="font-semibold text-brand" href="/(auth)/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
