"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Client login screen allowing سرو کاربران به ورود سریع با رابط فارسی.
 */
export default function LoginPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "ورود ناموفق بود");
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-[28px] border border-emerald-100 bg-white/90 p-8 shadow-xl shadow-emerald-100">
        <div className="space-y-4 text-right">
          <h2 className="text-3xl font-black text-slate-900">ورود به سرو</h2>
          <p className="text-sm text-slate-500">با وارد کردن شماره تلفن و رمز عبور خود وارد داشبورد شوید.</p>
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 text-right">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            شماره تلفن
            <input
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base shadow-inner shadow-slate-100 focus:border-brand focus:outline-none"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="مثلاً 09123456789"
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            رمز عبور
            <input
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base shadow-inner shadow-slate-100 focus:border-brand focus:outline-none"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              disabled={pending}
            />
          </label>
          <button type="submit" disabled={pending} className="rounded-2xl bg-brand px-6 py-3 text-base font-bold text-white shadow-lg shadow-brand/40">
            {pending ? "در حال ورود..." : "ورود"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          حسابی ندارید؟{" "}
          <Link className="font-semibold text-brand" href="/register">
            ساخت حساب جدید
          </Link>
        </p>
      </section>
    </main>
  );
}
