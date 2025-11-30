import Link from "next/link";

const features = [
  {
    title: "فروش سریع و دقیق",
    description: "ثبت سفارش، محاسبه تخفیف و صدور فاکتور تنها در چند ثانیه با رابط کاربری فارسی."
  },
  {
    title: "موجودی هوشمند",
    description: "نمودار مصرف مواد، هشدار اتمام موجودی و سرشماری آسان در هر شعبه."
  },
  {
    title: "باشگاه مشتریان",
    description: "امتیاز وفاداری، پیامک مناسبتی و تاریخچه خرید برای شناخت بهتر مهمانان."
  }
] as const;

/**
 * Marketing splash page introducing سرو با تمرکز بر تجربه کاملاً فارسی.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="relative overflow-hidden rounded-[32px] bg-white/90 p-10 text-right shadow-2xl shadow-emerald-200">
        <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-[radial-gradient(circle,_rgba(16,185,129,0.25),_transparent_60%)] md:block" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1 text-sm font-semibold text-brand">
            سرو | سامانه مدیریت کافه
          </span>
          <h1 className="text-4xl font-black text-slate-900 md:text-5xl">
            همه چیز برای اداره کافه شما؛ از ثبت فروش تا تحلیل سود، یکپارچه و فارسی
          </h1>
          <p className="text-lg leading-9 text-slate-600">
            سرو نسل تازهٔ نرم‌افزارهای مدیریت کافه است. با پشتیبانی از راست‌به‌چپ، فونت فارسی، رنگ‌بندی سبز الهام گرفته از
            طبیعت و ابزارهای حرفه‌ای، تیم شما با خیال راحت فروش، موجودی، حسابداری و مشتریان را مدیریت می‌کند.
          </p>
          <div className="flex flex-col gap-4 text-base font-semibold sm:flex-row sm:items-center sm:justify-start">
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-brand px-8 py-3 text-white shadow-lg shadow-brand/40">
              ورود به سرو
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-2xl border border-brand/40 px-8 py-3 text-brand hover:bg-brand/5">
              ساخت حساب جدید
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-3xl border border-emerald-100 bg-white/90 p-6 text-right shadow-md shadow-emerald-100 transition hover:-translate-y-1 hover:shadow-emerald-200"
          >
            <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
