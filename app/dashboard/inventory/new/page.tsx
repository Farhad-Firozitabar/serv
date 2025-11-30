"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PersianDateInput from "@/components/forms/PersianDateInput";

const numberFormatter = new Intl.NumberFormat("en-US");

// Helper function to format number with English digits and commas for input
const formatPrice = (value: string | number): string => {
  if (!value && value !== 0) return "";
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) return "";
  return numberFormatter.format(numValue);
};

// Helper function to parse formatted string back to number
const parsePrice = (value: string): string => {
  return value.replace(/[^\d]/g, "");
};

const STOCK_UNITS = [
  { value: "کیلو", label: "کیلو" },
  { value: "گرم", label: "گرم" },
  { value: "دونه", label: "دونه" },
  { value: "لیتر", label: "لیتر" },
  { value: "میلی‌لیتر", label: "میلی‌لیتر" },
  { value: "بسته", label: "بسته" },
  { value: "قوطی", label: "قوطی" }
];

/**
 * New raw material page allowing users to add items to inventory.
 */
export default function NewProductPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "0",
    stockUnit: "کیلو",
    category: "",
    purchaseDate: "",
    expirationDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      alert("لطفاً همه فیلدهای الزامی را تکمیل کنید.");
      return;
    }

    startTransition(async () => {
      const priceValue = parsePrice(formData.price);
      const price = parseFloat(priceValue);
      
      if (isNaN(price) || price < 0) {
        alert("لطفاً یک قیمت معتبر وارد کنید.");
        return;
      }

      const res = await fetch("/api/inventory/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: price,
          stock: parseInt(formData.stock, 10) || 0,
          stockUnit: formData.stockUnit || undefined,
          category: formData.category,
          purchaseDate: formData.purchaseDate || undefined,
          expirationDate: formData.expirationDate || undefined
        })
      });

      if (res.ok) {
        router.push("/dashboard/inventory");
      } else {
        const error = await res.json();
        alert(error.error || "ثبت ماده اولیه انجام نشد.");
      }
    });
  };

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">افزودن ماده اولیه جدید</h1>
        <p className="text-sm text-slate-500">مشخصات ماده اولیه را وارد کنید تا به انبار مواد اولیه اضافه شود.</p>
      </header>

      <form onSubmit={handleSubmit} className="w-full space-y-6 rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm shadow-emerald-50">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <header className="space-y-1 text-sm text-slate-500">
              <p className="font-semibold text-slate-900">مشخصات ماده اولیه</p>
              <p>اطلاعات پایه برای شناسایی سریع‌تر مواد اولیه را کامل کنید.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">
                  نام ماده اولیه *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-inner"
                  placeholder="مثلاً قهوه، شکر، شیر"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium text-slate-700">
                  دسته‌بندی *
                </label>
                <input
                  id="category"
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-inner"
                  placeholder="نوشیدنی گرم، شیرینی، میان‌وعده"
                />
                <p className="text-xs text-slate-500">برچسب‌گذاری صحیح، گزارش‌های دسته‌ای را دقیق‌تر می‌کند.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <header className="space-y-1 text-sm text-slate-500">
              <p className="font-semibold text-slate-900">موجودی و قیمت</p>
              <p>مقادیر اولیه را با دقت وارد کنید تا موجودی لحظه‌ای درست نمایش داده شود.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium text-slate-700">
                  قیمت خرید (تومان) *
                </label>
                <input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.price}
                  onChange={(e) => {
                    const rawValue = parsePrice(e.target.value);
                    // Only update if it's a valid number or empty
                    if (rawValue === "" || !isNaN(parseFloat(rawValue))) {
                      const formatted = rawValue === "" ? "" : formatPrice(rawValue);
                      setFormData({ ...formData, price: formatted });
                    }
                  }}
                  onBlur={(e) => {
                    // Ensure the value is formatted on blur
                    const rawValue = parsePrice(e.target.value);
                    if (rawValue) {
                      setFormData({ ...formData, price: formatPrice(rawValue) });
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-mono shadow-inner"
                  placeholder="0"
                  dir="ltr"
                />
                <p className="text-xs text-slate-500">ارزش خرید هر واحد ماده اولیه.</p>
              </div>
              <div className="grid gap-2">
                <label htmlFor="stock" className="text-sm font-medium text-slate-700">
                  موجودی اولیه
                </label>
                <div className="flex gap-2">
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-inner"
                    placeholder="0"
                  />
                  <select
                    id="stockUnit"
                    value={formData.stockUnit}
                    onChange={(e) => setFormData({ ...formData, stockUnit: e.target.value })}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner"
                  >
                    {STOCK_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500">در صورت خالی بودن انبار، این مقدار را صفر بگذارید.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <header className="space-y-1 text-sm text-slate-500">
              <p className="font-semibold text-slate-900">تاریخ‌ها</p>
              <p>ثبت تاریخ خرید و انقضا برای برنامه‌ریزی سفارش مجدد ضروری است.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              <PersianDateInput
                value={formData.purchaseDate}
                onChange={(value) => setFormData({ ...formData, purchaseDate: value })}
                label="تاریخ خرید"
                placeholder="1403/05/12"
              />
              <PersianDateInput
                value={formData.expirationDate}
                onChange={(value) => setFormData({ ...formData, expirationDate: value })}
                label="تاریخ انقضا"
                placeholder="1403/12/29"
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
          <Button type="submit" variant="primary" disabled={pending} className="flex-1">
            {pending ? "در حال ایجاد..." : "ثبت ماده اولیه"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            انصراف
          </Button>
        </div>
      </form>
    </section>
  );
}
