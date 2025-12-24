"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import PersianDateInput from "@/components/forms/PersianDateInput";
import jalaali from "jalaali-js";

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
 * Sales history component displaying sales with date filtering, pagination, and payment method editing.
 */
export default function SalesHistory({ initialSales, refreshKey }: SalesHistoryProps) {
  const [sales, setSales] = useState(initialSales);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [editingPaymentMethodValue, setEditingPaymentMethodValue] = useState<string>("");
  const [updatingPaymentMethod, setUpdatingPaymentMethod] = useState<string | null>(null);

  const fetchSales = async (pageNum: number = page, start?: string, end?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20"
      });
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      const res = await fetch(`/api/sales/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      fetchSales(page, startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    fetchSales(1, startDate, endDate);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handleDateFilter = () => {
    fetchSales(1, startDate, endDate);
    setPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchSales(1, "", "");
  };

  const handleUpdatePaymentMethod = async (saleId: string, paymentMethod: "CASH" | "CARD_TO_CARD" | "POS") => {
    setUpdatingPaymentMethod(saleId);
    try {
      const res = await fetch("/api/sales/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId, paymentMethod })
      });

      if (res.ok) {
        const data = await res.json();
        setSales((prev) =>
          prev.map((sale) => (sale.id === saleId ? data.sale : sale))
        );
        setEditingPaymentMethod(null);
        setEditingPaymentMethodValue("");
      } else {
        const error = await res.json();
        alert(error.error || "خطا در به‌روزرسانی روش پرداخت");
      }
    } catch (error) {
      console.error("Failed to update payment method:", error);
      alert("خطا در به‌روزرسانی روش پرداخت");
    } finally {
      setUpdatingPaymentMethod(null);
    }
  };

  const handleStartEditPaymentMethod = (saleId: string, currentMethod: string) => {
    setEditingPaymentMethod(saleId);
    setEditingPaymentMethodValue(currentMethod);
  };

  const handleCancelEditPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setEditingPaymentMethodValue("");
  };

  // Get current Persian date for default end date
  const getCurrentPersianDate = () => {
    const now = new Date();
    const jDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return `${jDate.jy}/${jDate.jm.toString().padStart(2, "0")}/${jDate.jd.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">فیلتر تاریخ</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <PersianDateInput
            value={startDate}
            onChange={setStartDate}
            label="از تاریخ"
            placeholder="1403/01/01"
          />
          <PersianDateInput
            value={endDate}
            onChange={setEndDate}
            label="تا تاریخ"
            placeholder={getCurrentPersianDate()}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleDateFilter}
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            اعمال فیلتر
          </button>
          {(startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              پاک کردن فیلتر
            </button>
          )}
        </div>
      </div>

      {/* Sales List */}
      {loading && sales.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center">
          <p className="text-slate-600">در حال بارگذاری...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center">
          <p className="text-slate-600">هیچ فروشی یافت نشد.</p>
        </div>
      ) : (
        <>
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
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">روش پرداخت:</span>
                  {editingPaymentMethod === sale.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editingPaymentMethodValue}
                        onChange={(e) => setEditingPaymentMethodValue(e.target.value)}
                        disabled={updatingPaymentMethod === sale.id}
                        className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs"
                        autoFocus
                      >
                        <option value="CASH">نقدی</option>
                        <option value="CARD_TO_CARD">کارت به کارت</option>
                        <option value="POS">دستگاه پوز</option>
                      </select>
                      <button
                        onClick={() => handleUpdatePaymentMethod(sale.id, editingPaymentMethodValue as "CASH" | "CARD_TO_CARD" | "POS")}
                        disabled={updatingPaymentMethod === sale.id || editingPaymentMethodValue === sale.paymentMethod}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={handleCancelEditPaymentMethod}
                        disabled={updatingPaymentMethod === sale.id}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        انصراف
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-slate-700">
                        {PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod}
                      </span>
                      <button
                        onClick={() => handleStartEditPaymentMethod(sale.id, sale.paymentMethod)}
                        disabled={updatingPaymentMethod === sale.id}
                        className="text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                      >
                        {updatingPaymentMethod === sale.id ? "در حال به‌روزرسانی..." : "ویرایش"}
                      </button>
                    </>
                  )}
                </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  fetchSales(newPage, startDate, endDate);
                }}
                disabled={page === 1 || loading}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                صفحه {page} از {totalPages}
              </span>
              <button
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  fetchSales(newPage, startDate, endDate);
                }}
                disabled={page === totalPages || loading}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
