import Link from "next/link";
import { getSession } from "@/lib/auth";

/**
 * Admin dashboard landing page summarising management actions.
 */
export default async function AdminHomePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
        دسترسی نامعتبر: فقط مدیران می‌توانند این صفحه را ببینند.
      </p>
    );
  }

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">کنترل پنل مدیران سرو</h1>
        <p className="text-sm text-slate-500">
          کاربران را مدیریت کنید، پلن‌ها را ارتقا دهید و سیاست‌های سامانه را از یکجا تنظیم نمایید.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          className="rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50 transition hover:-translate-y-1"
          href="/dashboard/admin/users"
        >
          <h2 className="text-lg font-bold text-slate-900">مدیریت کاربران</h2>
          <p className="mt-1 text-sm text-slate-500">افزودن نقش مدیر، ارتقای پلن یا تعلیق حساب‌ها.</p>
        </Link>
        <article className="rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50">
          <h2 className="text-lg font-bold text-slate-900">تنظیمات سامانه</h2>
          <p className="mt-1 text-sm text-slate-500">تعریف سیاست پشتیبان‌گیری، ایمیل پشتیبانی و تنظیم پیامک‌ها.</p>
        </article>
      </div>
    </section>
  );
}
