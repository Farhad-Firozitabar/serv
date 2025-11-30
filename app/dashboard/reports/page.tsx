import dynamic from "next/dynamic";
import { startOfMonth, subMonths } from "date-fns";
import type { Sale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import type { MonthlySalesPoint } from "@/types/reports";

const MONTHS_TO_DISPLAY = 12;
const numberFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const monthLabelFormatter = new Intl.DateTimeFormat("fa-IR", { month: "short", year: "numeric" });

const AreaChart = dynamic(() => import("@/components/charts/SalesAreaChart"), { ssr: false });

export default async function ReportsPage() {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const sales = await prisma.sale.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" }
  });

  const monthlyData = buildMonthlySeries(sales, MONTHS_TO_DISPLAY);
  const totalRevenue = monthlyData.reduce((sum, point) => sum + point.total, 0);
  const totalOrders = monthlyData.reduce((sum, point) => sum + point.orders, 0);
  const currentMonth = monthlyData.at(-1);
  const previousMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : null;
  const emptyPoint: MonthlySalesPoint = { label: "—", total: 0, orders: 0 };
  const bestMonth = monthlyData.reduce(
    (best, point) => (point.total > best.total ? point : best),
    monthlyData[0] ?? emptyPoint
  );
  const averageTicket = totalOrders ? totalRevenue / totalOrders : 0;
  const growthRate =
    currentMonth && previousMonth && previousMonth.total > 0
      ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
      : null;
  const stats = [
    {
      label: "درآمد ۱۲ ماه اخیر",
      value: formatCurrency(totalRevenue),
      helper: `${formatNumber(totalOrders)} فاکتور ثبت شده`
    },
    {
      label: "میانگین ارزش هر فاکتور",
      value: totalOrders ? formatCurrency(averageTicket) : "۰ تومان",
      helper: totalOrders ? "میانگین سفارش‌های ثبت‌شده" : "برای نمایش به اولین فروش نیاز است"
    },
    {
      label: "ماه اوج فروش",
      value: bestMonth?.total ? formatCurrency(bestMonth.total) : "۰ تومان",
      helper: bestMonth?.total ? bestMonth.label : "هنوز ماه پر فروشی ثبت نشده است"
    },
    {
      label: "رشد ماه جاری",
      value: growthRate !== null ? formatPercent(growthRate) : "—",
      helper:
        growthRate !== null && previousMonth
          ? `نسبت به ${previousMonth.label}`
          : "حداقل دو ماه داده نیاز است",
      intent: growthRate
    }
  ];

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">گزارش‌ها و نمودارها</h1>
        <p className="text-sm text-slate-500">روند فروش ماهانه، بهترین ماه و میانگین سبد خرید را یک‌جا رصد کنید.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm shadow-slate-100"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
            <p
              className={`mt-1 text-xs ${
                typeof stat.intent === "number"
                  ? stat.intent >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                  : "text-slate-500"
              }`}
            >
              {stat.helper}
            </p>
          </article>
        ))}
      </div>
      <div className="rounded-3xl border border-emerald-100 bg-white/95 p-4 shadow-lg shadow-emerald-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">روند فروش ماهانه</p>
            <p className="text-xs text-slate-500">
              {monthlyData.length ? `از ${monthlyData[0].label} تا ${currentMonth?.label}` : "داده‌ای برای نمایش وجود ندارد"}
            </p>
          </div>
          {growthRate !== null && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                growthRate >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {growthRate >= 0 ? "رشد " : "افت "}
              {formatPercent(growthRate, { withSign: false })}
            </span>
          )}
        </div>
        <AreaChart data={monthlyData} />
      </div>
    </section>
  );
}

function buildMonthlySeries(sales: Sale[], months = 12): MonthlySalesPoint[] {
  const now = startOfMonth(new Date());
  const monthDescriptors = Array.from({ length: months }, (_, idx) => {
    const monthStart = subMonths(now, months - idx - 1);
    const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
    return { key, monthStart };
  });
  const buckets = new Map(
    monthDescriptors.map(({ key, monthStart }) => [key, { total: 0, orders: 0, monthStart }])
  );

  for (const sale of sales) {
    const created = new Date(sale.createdAt);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total += Number(sale.total);
    bucket.orders += 1;
  }

  return monthDescriptors.map(({ key, monthStart }) => {
    const bucket = buckets.get(key)!;
    return {
      label: monthLabelFormatter.format(monthStart),
      total: Number(bucket.total.toFixed(2)),
      orders: bucket.orders
    };
  });
}

function formatCurrency(value: number) {
  return `${numberFormatter.format(Math.round(value))} تومان`;
}

function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

function formatPercent(value: number, options: { withSign?: boolean } = {}) {
  const { withSign = true } = options;
  const formatted = percentFormatter.format(Math.abs(value));
  if (!withSign) {
    return `${formatted}%`;
  }
  return `${value >= 0 ? "+" : "-"}${formatted}%`;
}
