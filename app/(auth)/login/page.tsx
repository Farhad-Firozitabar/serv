"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Client login screen allowing CafePOS users to authenticate into the dashboard.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <h2 className="text-3xl font-semibold text-brand">Sign in to CafePOS</h2>
      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Email</span>
          <input
            className="rounded border border-slate-300 p-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@cafe.com"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Password</span>
          <input
            className="rounded border border-slate-300 p-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className="rounded bg-brand px-4 py-2 font-semibold text-white">
          Sign in
        </button>
      </form>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account? {" "}
        <Link className="font-semibold text-brand" href="/(auth)/register">
          Create one
        </Link>
      </p>
    </main>
  );
}
