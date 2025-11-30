import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear
} from "date-fns";
import Link from "next/link";
import clsx from "clsx";
import type { SVGProps } from "react";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import PaymentMethodFilter from "@/components/dashboard/PaymentMethodFilter";

const WEEK_START = 6; // Saturday in date-fns numbering for Persian calendar weeks
const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" });
const dayLabelFormatter = new Intl.DateTimeFormat("fa-IR", { weekday: "short", month: "short", day: "numeric" });
const dayRangeFormatter = new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("fa-IR", { month: "long", year: "numeric" });
const yearFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric" });
const countFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type Period = "day" | "week" | "month" | "year";

interface TimeframeOption {
  id: "week" | "month" | "sixMonths" | "year" | "all";
  label: string;
  description: string;
  period: Period;
  segments?: number;
  mode?: "rolling" | "historical";
}

const TIMEFRAME_OPTIONS: readonly TimeframeOption[] = [
  { id: "week", label: "هفتگی", description: "جزئیات عملکرد ۷ روز اخیر", period: "day", segments: 7 },
  { id: "month", label: "ماهانه", description: "هفته‌بندی ۴ هفته‌ی گذشته", period: "week", segments: 4 },
  { id: "sixMonths", label: "۶ ماه", description: "روند شش ماه اخیر", period: "month", segments: 6 },
  { id: "year", label: "سالانه", description: "۱۲ ماه گذشته", period: "month", segments: 12 },
  { id: "all", label: "کل دوره", description: "از اولین فروش ثبت شده تاکنون", period: "year", mode: "historical" }
] as const;

type TimeframeId = (typeof TIMEFRAME_OPTIONS)[number]["id"];

interface SaleItemWithCost {
  id: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

interface EnrichedSale {
  id: string;
  createdAt: Date;
  phone: string | null;
  paymentMethod: string;
  revenue: number;
  expense: number;
  profit: number;
  items: SaleItemWithCost[];
}

interface PeriodSegment {
  key: string;
  label: string;
  start: Date;
  end: Date;
  period: Period;
  revenue: number;
  expense: number;
  profit: number;
  orders: number;
}

interface TimeframeReport {
  option: TimeframeOption;
  segments: PeriodSegment[];
  totals: {
    revenue: number;
    expense: number;
    profit: number;
    orders: number;
  };
  margin: number | null;
}

interface InventoryPurchaseDetail {
  id: string;
  productName: string;
  qty: number;
  amount: number;
  reason: string;
  createdAt: Date;
}

interface InventoryAccountingRow {
  productId: string;
  productName: string;
  stockUnit: string | null;
  totalQty: number;
  totalAmount: number;
  lastPurchase: Date;
  entries: number;
}

interface AccountingPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقدی",
  CARD_TO_CARD: "کارت به کارت",
  POS: "دستگاه پوز"
};

/**
 * Accounting dashboard showing profitability per sale, inventory status, and weekly/monthly/yearly reporting.
 */
export default async function AccountingPage({ searchParams = {} }: AccountingPageProps = {}) {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan("PROFESSIONAL");
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const rangeParamRaw = searchParams.range;
  const rangeParam = Array.isArray(rangeParamRaw) ? rangeParamRaw[0] : rangeParamRaw;
  const segmentParamRaw = searchParams.segment;
  const segmentParam = Array.isArray(segmentParamRaw) ? segmentParamRaw[0] : segmentParamRaw;
  const paymentMethodParamRaw = searchParams.paymentMethod;
  const paymentMethodFilter = Array.isArray(paymentMethodParamRaw) ? paymentMethodParamRaw[0] : paymentMethodParamRaw;
  const selectedTimeframe = TIMEFRAME_OPTIONS.find((option) => option.id === rangeParam) ?? TIMEFRAME_OPTIONS[0];

  const [sales, inventoryLogs] = await Promise.all([
    prisma.sale.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                cost: true,
                price: true
              }
            },
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    }),
    prisma.inventoryLog.findMany({
      where: {
        product: { userId: session.userId }
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            stockUnit: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const enrichedSales: EnrichedSale[] = sales.map((sale) => {
    const items: SaleItemWithCost[] = sale.items.map((item) => {
      const menuItemCost = item.menuItem?.cost ? Number(item.menuItem.cost) : null;
      const productCost = item.product ? Number(item.product.price) : null;
      return {
        id: item.id,
        name: item.menuItem?.name ?? item.product?.name ?? "آیتم",
        qty: item.qty,
        price: Number(item.price),
        cost: menuItemCost ?? productCost ?? 0
      };
    });
    const revenue = Number(sale.total);
    const expense = items.reduce((sum, item) => sum + item.cost * item.qty, 0);
    return {
      id: sale.id,
      createdAt: sale.createdAt,
      phone: sale.phone,
      paymentMethod: sale.paymentMethod,
      revenue,
      expense,
      profit: revenue - expense,
      items
    };
  });

  // Filter by payment method if specified
  const filteredSales = paymentMethodFilter
    ? enrichedSales.filter((sale) => sale.paymentMethod === paymentMethodFilter)
    : enrichedSales;

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalExpense = filteredSales.reduce((sum, sale) => sum + sale.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const averageProfit = filteredSales.length ? totalProfit / filteredSales.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : null;

  const positiveInventoryLogs = inventoryLogs.filter((log) => log.change > 0);
  const inventoryAccountingReport: InventoryAccountingRow[] = (
    Object.values(
      positiveInventoryLogs.reduce((acc, log) => {
        if (!acc[log.productId]) {
          acc[log.productId] = {
            productId: log.productId,
            productName: log.product.name,
            stockUnit: log.product.stockUnit,
            totalQty: 0,
            totalAmount: 0,
            lastPurchase: log.createdAt,
            entries: 0
          };
        }
        acc[log.productId].totalQty += log.change;
        acc[log.productId].totalAmount += Number(log.product.price) * log.change;
        acc[log.productId].entries += 1;
        if (log.createdAt > acc[log.productId].lastPurchase) {
          acc[log.productId].lastPurchase = log.createdAt;
        }
        return acc;
      }, {} as Record<string, InventoryAccountingRow>)
    ) as InventoryAccountingRow[]
  ).sort((a, b) => b.totalAmount - a.totalAmount);
  const totalMaterialsSpend = inventoryAccountingReport.reduce((sum, row) => sum + row.totalAmount, 0);
  const totalMaterialsEntries = positiveInventoryLogs.length;
  const totalMaterialsQty = inventoryAccountingReport.reduce((sum, row) => sum + row.totalQty, 0);
  const averageMaterialEntryCost = totalMaterialsEntries > 0 ? totalMaterialsSpend / totalMaterialsEntries : 0;

  const timeframeReport = buildTimeframeReport(filteredSales, selectedTimeframe);
  const activeSegment =
    (segmentParam && timeframeReport.segments.find((segment) => segment.key === segmentParam)) ??
    timeframeReport.segments.at(-1) ??
    null;
  const segmentSales =
    activeSegment?.start && activeSegment.end
      ? filteredSales.filter((sale) => sale.createdAt >= activeSegment.start && sale.createdAt <= activeSegment.end)
      : [];
  const segmentRevenue = segmentSales.reduce((sum, sale) => sum + sale.revenue, 0);
  const segmentExpense = segmentSales.reduce((sum, sale) => sum + sale.expense, 0);
  const segmentProfit = segmentRevenue - segmentExpense;
  const segmentMargin = segmentRevenue > 0 ? (segmentProfit / segmentRevenue) * 100 : null;
  const inventoryPurchases: InventoryPurchaseDetail[] =
    activeSegment
      ? positiveInventoryLogs
          .filter((log) => log.createdAt >= activeSegment.start && log.createdAt <= activeSegment.end)
          .map((log) => ({
            id: log.id,
            productName: log.product.name,
            qty: log.change,
            amount: Number(log.product.price) * log.change,
            reason: log.reason,
            createdAt: log.createdAt
          }))
      : [];
  const inventorySpendTotal = inventoryPurchases.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">حسابداری</p>
        <h1 className="text-3xl font-bold text-slate-900">دفتر سود و زیان و کنترل موجودی</h1>
        <p className="text-sm text-slate-500">
          عملکرد هر فاکتور، روند سودآوری هفتگی/ماهانه/سالانه و وضعیت مواد اولیه را در یک نگاه بررسی کنید.
        </p>
      </header>

      <PaymentMethodFilter />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="درآمد کل" helper={`${formatCount(filteredSales.length)} فاکتور ثبت شده`} value={formatCurrency(totalRevenue)} />
        <StatCard
          label="هزینه کالا"
          helper="جمع هزینه منوی فروخته‌شده"
          value={formatCurrency(totalExpense)}
        />
        <StatCard
          label="سود خالص"
          helper={profitMargin !== null ? `حاشیه سود ${formatPercent(profitMargin, { withSign: false })}` : "نیازمند حداقل یک فروش"}
          value={formatCurrency(totalProfit)}
          intent={totalProfit}
        />
        <StatCard
          label="میانگین سود هر فاکتور"
          helper="بر اساس فاکتورهای تایید شده"
          value={formatCurrency(averageProfit)}
        />
      </div>

      <section className="space-y-5 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">گزارش‌های دوره‌ای</h2>
            <p className="text-sm text-slate-500">
              {selectedTimeframe.description}
            </p>
          </div>
          <TimeframePicker active={selectedTimeframe.id} />
        </div>
        <article className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-inner shadow-emerald-50/40">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{selectedTimeframe.label}</p>
              <p className="text-xs text-slate-500">{formatRangeSummary(timeframeReport.segments)}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <p>درآمد: <span className="font-semibold text-slate-900">{formatCurrency(timeframeReport.totals.revenue)}</span></p>
              <p>هزینه: <span className="font-semibold text-slate-900">{formatCurrency(timeframeReport.totals.expense)}</span></p>
              <p>سود: <span className={`font-semibold ${timeframeReport.totals.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(timeframeReport.totals.profit)}</span></p>
              <p>تعداد فاکتور: <span className="font-semibold text-slate-900">{formatCount(timeframeReport.totals.orders)}</span></p>
              <p>حاشیه سود: <span className="font-semibold text-slate-900">{formatPercent(timeframeReport.margin)}</span></p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {timeframeReport.segments
              .slice()
              .reverse()
              .map((segment) => {
                const isActive = activeSegment?.key === segment.key;
                return (
                  <Link
                    key={segment.key}
                    href={buildAccountingHref(selectedTimeframe.id, segment.key)}
                    scroll={false}
                    className={clsx(
                      "rounded-2xl border px-4 py-3 text-xs transition hover:border-emerald-300",
                      isActive
                        ? "border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-sm shadow-emerald-200"
                        : "border-slate-100 bg-slate-50/60 text-slate-600"
                    )}
                  >
                    <p className="text-sm font-semibold">{segment.label}</p>
                    <div className="mt-2 space-y-1">
                      <p>درآمد: <span className="font-semibold text-slate-900">{formatCurrency(segment.revenue)}</span></p>
                      <p>هزینه: <span className="font-semibold text-slate-900">{formatCurrency(segment.expense)}</span></p>
                      <p>
                        سود:{" "}
                        <span className={`font-semibold ${segment.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {formatCurrency(segment.profit)}
                        </span>
                        <span className="mr-1 text-[11px] text-slate-500">
                          {segment.revenue > 0 ? formatPercent((segment.profit / segment.revenue) * 100) : "—"}
                        </span>
                      </p>
                      <p>فاکتور: <span className="font-semibold text-slate-900">{formatCount(segment.orders)}</span></p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </article>
        {activeSegment && (
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">جزئیات بازه منتخب</p>
                <p className="text-xs text-slate-600">{activeSegment.label}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <p>درآمد: <span className="font-semibold text-slate-900">{formatCurrency(segmentRevenue)}</span></p>
                <p>هزینه: <span className="font-semibold text-slate-900">{formatCurrency(segmentExpense)}</span></p>
                <p>سود: <span className={`font-semibold ${segmentProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(segmentProfit)}</span></p>
                <p>حاشیه سود: <span className="font-semibold text-slate-900">{formatPercent(segmentMargin)}</span></p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-emerald-100/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">فروش‌های این بازه</p>
                    <p className="text-xs text-slate-500">جزئیات {formatCount(segmentSales.length)} فاکتور</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">تا {formatDateTime(activeSegment.end)}</span>
                </div>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  {segmentSales.length === 0 ? (
                    <p className="text-slate-500">فروشی در این بازه ثبت نشده است.</p>
                  ) : (
                    segmentSales
                      .slice(0, 6)
                      .map((sale) => (
                        <div key={sale.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>#{sale.id.slice(0, 6)}</span>
                            <span>{formatDateTime(sale.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(sale.revenue)}</p>
                          <p className="text-[11px] text-slate-500">
                            هزینه: {formatCurrency(sale.expense)} · سود: <span className={sale.profit >= 0 ? "text-emerald-700" : "text-rose-700"}>{formatCurrency(sale.profit)}</span>
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-emerald-100/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">مواد اولیه</p>
                    <p className="text-xs text-slate-500">جمع خرید ثبت‌شده: {formatCurrency(inventorySpendTotal)}</p>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-label="نمایش هزینه مواد اولیه" title="نمایش هزینه مواد اولیه">
                    <EyeIcon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  {inventoryPurchases.length === 0 ? (
                    <p className="text-slate-500">در این بازه خریدی برای مواد اولیه ثبت نشده است.</p>
                  ) : (
                    inventoryPurchases.map((purchase) => (
                      <div key={purchase.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{purchase.productName}</span>
                          <span>{formatDateTime(purchase.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(purchase.amount)}</p>
                        <p className="text-[11px] text-slate-500">تعداد {formatCount(purchase.qty)} · علت: {purchase.reason}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </article>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">دفتر فروش به تفکیک سود و هزینه</h2>
            <p className="text-sm text-slate-500">
              هر فاکتور با تاریخ دقیق، مبلغ فروش، هزینه مواد و سود/زیان نهایی ثبت شده است.
            </p>
          </div>
        </div>
        {filteredSales.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-600">
            {paymentMethodFilter ? `فروشی با روش پرداخت ${PAYMENT_METHOD_LABELS[paymentMethodFilter]} ثبت نشده است.` : "هنوز فروشی برای محاسبه سود و زیان ثبت نشده است."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right">جزئیات فاکتور</th>
                  <th className="px-4 py-3 text-right">روش پرداخت</th>
                  <th className="px-4 py-3 text-right">درآمد</th>
                  <th className="px-4 py-3 text-right">هزینه</th>
                  <th className="px-4 py-3 text-right">سود/زیان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <span>فاکتور #{sale.id.slice(0, 8)}</span>
                          <span>{formatDateTime(sale.createdAt)}</span>
                        </div>
                        {sale.phone && <p className="text-xs text-slate-500">مشتری: {sale.phone}</p>}
                        <p className="text-xs text-slate-500">روش پرداخت: {PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod}</p>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {sale.items.map((item) => (
                            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                              <span>{item.qty} × {item.name}</span>
                              <span className="text-slate-500">{formatCurrency(item.price * item.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{formatCurrency(sale.revenue)}</p>
                      <p className="text-xs text-slate-500">{formatCount(sale.items.length)} آیتم</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{formatCurrency(sale.expense)}</p>
                      <p className="text-xs text-slate-500">هزینه مواد</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`font-semibold ${sale.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {formatCurrency(sale.profit)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sale.revenue > 0 ? formatPercent((sale.profit / sale.revenue) * 100) : "—"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-amber-100 bg-white/95 p-5 shadow-sm shadow-amber-100">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">گزارش حسابداری مواد اولیه</h2>
            <p className="text-sm text-slate-500">
              جمع خریدهای ثبت شده: {formatCurrency(totalMaterialsSpend)} · تعداد اسناد ورودی: {formatCount(totalMaterialsEntries)}
            </p>
          </div>
          <a
            href="/dashboard/inventory"
            className="inline-flex items-center justify-center rounded-2xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50/70"
          >
            ثبت خرید جدید
          </a>
        </div>
        {inventoryAccountingReport.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-sm text-amber-700">
            هنوز خریدی برای مواد اولیه ثبت نشده است. از بخش انبار برای ثبت هزینه‌ها استفاده کنید.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm shadow-amber-50">
                <p className="text-xs font-semibold text-amber-700">میانگین هزینه هر سند خرید</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(averageMaterialEntryCost)}</p>
                <p className="text-xs text-slate-500">بر اساس {formatCount(totalMaterialsEntries)} ثبت ورود</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm shadow-amber-50">
                <p className="text-xs font-semibold text-amber-700">حجم مواد تامین شده</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCount(totalMaterialsQty)}</p>
                <p className="text-xs text-slate-500">جمع مقدار مواد اولیه ثبت شده</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-100 text-right text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-amber-700">
                    <th scope="col" className="px-4 py-3 font-semibold">نام ماده</th>
                    <th scope="col" className="px-4 py-3 font-semibold">اسناد</th>
                    <th scope="col" className="px-4 py-3 font-semibold">مقدار تامین شده</th>
                    <th scope="col" className="px-4 py-3 font-semibold">هزینه کل</th>
                    <th scope="col" className="px-4 py-3 font-semibold">میانگین قیمت</th>
                    <th scope="col" className="px-4 py-3 font-semibold">آخرین خرید</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {inventoryAccountingReport.map((row) => {
                    const averageUnitCost = row.totalQty > 0 ? row.totalAmount / row.totalQty : 0;
                    return (
                      <tr key={row.productId} className="text-slate-700">
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="font-semibold text-slate-900">{row.productName}</p>
                          <p className="text-xs text-slate-500">{row.stockUnit || "بدون واحد مشخص"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{formatCount(row.entries)}</p>
                          <p className="text-xs text-slate-500">ثبت ورود</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{formatCount(row.totalQty)}</p>
                          <p className="text-xs text-slate-500">{row.stockUnit || ""}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.totalAmount)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(averageUnitCost)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(row.lastPurchase)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </section>
  );
}

function buildTimeframeReport(sales: EnrichedSale[], option: TimeframeOption): TimeframeReport {
  const segments = buildPeriodSegments(sales, option);
  const totals = segments.reduce(
    (acc, segment) => {
      acc.revenue += segment.revenue;
      acc.expense += segment.expense;
      acc.profit += segment.profit;
      acc.orders += segment.orders;
      return acc;
    },
    { revenue: 0, expense: 0, profit: 0, orders: 0 }
  );
  const margin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : null;
  return { option, segments, totals, margin };
}

function buildPeriodSegments(sales: EnrichedSale[], option: TimeframeOption): PeriodSegment[] {
  const mode = option.mode ?? "rolling";
  const now = new Date();
  const descriptors: Array<{ start: Date; end: Date }> = [];

  if (mode === "historical") {
    const earliestSaleDate =
      sales.length > 0
        ? sales.reduce((min, sale) => (sale.createdAt < min ? sale.createdAt : min), sales[0].createdAt)
        : now;
    let cursor = getPeriodStart(option.period, earliestSaleDate);
    const last = getPeriodStart(option.period, now);
    while (cursor <= last) {
      descriptors.push({ start: cursor, end: getPeriodEnd(option.period, cursor) });
      cursor = shiftPeriod(cursor, 1, option.period);
    }
    if (!descriptors.length) {
      const start = getPeriodStart(option.period, now);
      descriptors.push({ start, end: getPeriodEnd(option.period, start) });
    }
  } else {
    const count = option.segments ?? 1;
    const base = getPeriodStart(option.period, now);
    for (let i = count - 1; i >= 0; i--) {
      const shifted = shiftPeriod(base, -i, option.period);
      const start = getPeriodStart(option.period, shifted);
      descriptors.push({ start, end: getPeriodEnd(option.period, start) });
    }
  }

  return descriptors.map(({ start, end }) => {
    const periodSales = sales.filter((sale) => sale.createdAt >= start && sale.createdAt <= end);
    const revenue = periodSales.reduce((sum, sale) => sum + sale.revenue, 0);
    const expense = periodSales.reduce((sum, sale) => sum + sale.expense, 0);
    const profit = revenue - expense;
    const orders = periodSales.length;

    return {
      key: `${option.id}-${start.toISOString()}`,
      label: formatPeriodLabel(option.period, start, end),
      start,
      end,
      period: option.period,
      revenue,
      expense,
      profit,
      orders
    };
  });
}

function formatPeriodLabel(period: Period, start: Date, end: Date) {
  if (period === "day") {
    return dayLabelFormatter.format(start);
  }
  if (period === "week") {
    return `${dayRangeFormatter.format(start)} تا ${dayRangeFormatter.format(end)}`;
  }
  if (period === "month") {
    return monthFormatter.format(start);
  }
  return yearFormatter.format(start);
}

function formatRangeSummary(segments: PeriodSegment[]) {
  if (!segments.length) {
    return "داده‌ای برای این بازه ثبت نشده است";
  }
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (segments.length === 1) {
    return first.label;
  }
  if (first.period === "day") {
    return `${dayLabelFormatter.format(first.start)} تا ${dayLabelFormatter.format(last.start)}`;
  }
  if (first.period === "week") {
    return `${dayRangeFormatter.format(first.start)} تا ${dayRangeFormatter.format(last.end)}`;
  }
  if (first.period === "month") {
    return `${monthFormatter.format(first.start)} تا ${monthFormatter.format(last.start)}`;
  }
  return `${yearFormatter.format(first.start)} تا ${yearFormatter.format(last.start)}`;
}

function getPeriodStart(period: Period, date: Date) {
  switch (period) {
    case "day":
      return startOfDay(date);
    case "week":
      return startOfWeek(date, { weekStartsOn: WEEK_START });
    case "month":
      return startOfMonth(date);
    case "year":
    default:
      return startOfYear(date);
  }
}

function getPeriodEnd(period: Period, date: Date) {
  switch (period) {
    case "day":
      return endOfDay(date);
    case "week":
      return endOfWeek(date, { weekStartsOn: WEEK_START });
    case "month":
      return endOfMonth(date);
    case "year":
    default:
      return endOfYear(date);
  }
}

function shiftPeriod(date: Date, amount: number, period: Period) {
  switch (period) {
    case "day":
      return addDays(date, amount);
    case "week":
      return addWeeks(date, amount);
    case "month":
      return addMonths(date, amount);
    case "year":
    default:
      return addYears(date, amount);
  }
}

function buildAccountingHref(range: TimeframeId, segmentKey?: string, paymentMethod?: string) {
  const params = new URLSearchParams();
  const defaultRange = TIMEFRAME_OPTIONS[0].id;
  if (range !== defaultRange || segmentKey || paymentMethod) {
    params.set("range", range);
  }
  if (segmentKey) {
    params.set("segment", segmentKey);
  }
  if (paymentMethod) {
    params.set("paymentMethod", paymentMethod);
  }
  const query = params.toString();
  return query ? `/dashboard/accounting?${query}` : "/dashboard/accounting";
}

function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

function formatPercent(value: number | null | undefined, options: { withSign?: boolean } = {}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const { withSign = true } = options;
  const formatted = percentFormatter.format(Math.abs(value));
  if (!withSign) {
    return `${formatted}%`;
  }
  return `${value >= 0 ? "+" : "-"}${formatted}%`;
}

function formatCount(value: number) {
  return countFormatter.format(Math.round(value));
}

function TimeframePicker({ active }: { active: TimeframeId }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMEFRAME_OPTIONS.map((option) => {
        const isActive = option.id === active;
        const href = buildAccountingHref(option.id);
        return (
          <Link
            key={option.id}
            href={href}
            scroll={false}
            className={clsx(
              "rounded-2xl border px-3 py-1.5 text-xs font-semibold transition",
              isActive
                ? "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 576 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M572.52 241.4C518.29 135.59 407.73 64 288 64S57.71 135.59 3.48 241.4a48 48 0 000 29.2C57.71 376.41 168.27 448 288 448s230.29-71.59 284.52-177.4a48 48 0 000-29.2zM288 400a112 112 0 11112-112 112.13 112.13 0 01-112 112zm0-176a64 64 0 1064 64 64.07 64.07 0 00-64-64z" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  helper,
  intent
}: {
  label: string;
  value: string;
  helper: string;
  intent?: number;
}) {
  const intentClass =
    typeof intent === "number"
      ? intent >= 0
        ? "text-emerald-700"
        : "text-rose-700"
      : "text-slate-500";
  return (
    <article className="rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm shadow-slate-100">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className={`mt-1 text-xs ${intentClass}`}>{helper}</p>
    </article>
  );
}
