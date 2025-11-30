"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PlanSelector from "@/components/forms/PlanSelector";

/**
 * Registration page onboarding new سرو کاربران با متن فارسی و رابط راست‌به‌چپ.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [plan, setPlan] = useState<"BASIC" | "PROFESSIONAL">("BASIC");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.phone || !formData.password) {
      setError("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }

    if (formData.password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          subscriptionTier: plan
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setSuccess(data.message);
          setError("");
          setTimeout(() => {
            router.push("/login?registered=true");
          }, 3000);
        } else {
          router.push("/login?registered=true");
        }
      } else {
        const data = await res.json();
        setError(data.error || "ثبت‌نام انجام نشد.");
        setSuccess("");
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-[28px] border border-emerald-100 bg-white/95 p-10 shadow-2xl shadow-emerald-100">
        <header className="space-y-3 text-right">
          <h2 className="text-3xl font-black text-slate-900">ساخت حساب سرو</h2>
          <p className="text-sm text-slate-500">برای دسترسی به داشبورد، اطلاعات زیر را تکمیل کرده و پلن مناسب را انتخاب کنید.</p>
        </header>
        {error && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-700">{error}</p>}
        {success && <p className="mt-4 rounded-2xl border border-green-100 bg-green-50/80 p-3 text-sm text-green-700">{success}</p>}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 text-right">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              نام و نام خانوادگی
            </label>
            <input
              id="name"
              required
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base shadow-inner focus:border-brand focus:outline-none"
              placeholder="مثلاً سمانه صادقی"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={pending}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="phone">
              شماره تلفن
            </label>
            <input
              id="phone"
              type="tel"
              required
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base shadow-inner focus:border-brand focus:outline-none"
              placeholder="مثلاً 09123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={pending}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base shadow-inner focus:border-brand focus:outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={pending}
            />
          </div>
          <PlanSelector value={plan} onChange={setPlan} readOnly={pending} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-2xl bg-brand px-6 py-3 text-base font-bold text-white shadow-lg shadow-brand/40"
          >
            {pending ? "در حال ایجاد حساب..." : "ایجاد حساب"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link className="font-semibold text-brand" href="/login">
            ورود به حساب
          </Link>
        </p>
      </section>
    </main>
  );
}
