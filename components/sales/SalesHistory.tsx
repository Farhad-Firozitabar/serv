"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";

interface SaleItem {
  id: string;
  qty: number;
  price: number;
  menuItem: {
    name: string;
  } | null;
}

interface Sale {
  id: string;
  total: number;
  phone: string | null;
  paymentMethod: string;
  createdAt: Date;
  items: SaleItem[];
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقدی",
  CARD_TO_CARD: "کارت به کارت",
  POS: "دستگاه پوز"
};

interface SalesHistoryProps {
  initialSales: Sale[];
  refreshKey?: number;
}

/**
 * Sales history component displaying recent sales.
 */
export default function SalesHistory({ initialSales, refreshKey }: SalesHistoryProps) {
  const [sales, setSales] = useState(initialSales);

  useEffect(() => {
    const refreshSales = async () => {
      try {
        const res = await fetch("/api/sales/list");
        if (res.ok) {
          const data = await res.json();
          setSales(data.sales || []);
        }
      } catch (error) {
        console.error("Failed to refresh sales:", error);
      }
    };

    if (refreshKey && refreshKey > 0) {
      refreshSales();
    }
  }, [refreshKey]);

  if (sales.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center">
        <p className="text-slate-600">هنوز فروشی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sales.map((sale) => (
        <article key={sale.id} className="rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>فاکتور #{sale.id.slice(0, 8)}</span>
            <span>{new Date(sale.createdAt).toLocaleDateString("fa-IR")}</span>
          </div>
          {sale.phone && (
            <p className="mt-2 text-xs text-slate-500">شماره تماس: {sale.phone}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">روش پرداخت: {PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(Number(sale.total))}</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {sale.items.map((item) => (
              <li key={item.id}>
                {item.qty} × {item.menuItem?.name || "آیتم"} — {formatCurrency(Number(item.price) * item.qty)}
              </li>
            ))}
          </ul>
          <Link
            href={`/dashboard/sales/${sale.id}`}
            className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            مشاهده و چاپ فاکتور →
          </Link>
        </article>
      ))}
    </div>
  );
}
