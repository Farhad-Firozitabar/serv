"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";

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

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string | null;
}

/**
 * New sale page allowing users to create a sale transaction from menu items.
 */
export default function NewSalePage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<Array<{ menuItemId: string; qty: number }>>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/menu/list-for-sales")
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data.menuItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)));

  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addItem = (menuItemId: string) => {
    const existing = items.find((item) => item.menuItemId === menuItemId);
    if (existing) {
      setItems(items.map((item) => (item.menuItemId === menuItemId ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setItems([...items, { menuItemId, qty: 1 }]);
    }
  };

  const removeItem = (menuItemId: string) => {
    setItems(items.filter((item) => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(menuItemId);
    } else {
      setItems(items.map((item) => (item.menuItemId === menuItemId ? { ...item, qty } : item)));
    }
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      alert("لطفاً حداقل یک آیتم به فاکتور اضافه کنید.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          phone: phone.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/sales/${data.sale.id}`);
      } else {
        const error = await res.json();
        alert(error.error || "ثبت فروش انجام نشد.");
      }
    });
  };

  const total = items.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    return sum + (menuItem ? Number(menuItem.price) * item.qty : 0);
  }, 0);

  if (loading) {
    return <div className="p-8 text-right text-sm text-slate-600">در حال بارگذاری منو...</div>;
  }

  if (menuItems.length === 0) {
    return (
      <section className="space-y-6 text-right">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">فروش جدید</h1>
          <p className="text-sm text-slate-500">ابتدا آیتم‌هایی به منو اضافه کنید.</p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center">
          <p className="text-slate-600">هنوز آیتمی در منو وجود ندارد.</p>
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard/menu")}
            className="mt-4"
          >
            افزودن به منو
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">فروش جدید</h1>
        <p className="text-sm text-slate-500">آیتم‌های منو را انتخاب کنید، تعداد را تعیین کنید و بلافاصله فاکتور صادر نمایید.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">منو</h2>
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm"
              >
                <option value="all">همه دسته‌ها</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid gap-2">
            {filteredMenuItems.map((menuItem) => (
              <button
                key={menuItem.id}
                type="button"
                onClick={() => addItem(menuItem.id)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-right transition hover:border-emerald-400 hover:bg-emerald-50/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{menuItem.name}</p>
                    {menuItem.category && (
                      <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {menuItem.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrency(Number(menuItem.price))}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50">
          <h2 className="text-lg font-semibold text-slate-900">سبد خرید</h2>

          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              شماره تماس (اختیاری)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm"
              placeholder="09123456789"
              disabled={pending}
            />
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">هنوز آیتمی اضافه نشده است.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                if (!menuItem) return null;
                return (
                  <div key={item.menuItemId} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{menuItem.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(Number(menuItem.price))} × {item.qty} = {formatCurrency(
                          Number(menuItem.price) * item.qty
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItemId, item.qty - 1)}
                        className="rounded-full border border-slate-300 px-2 py-1 transition hover:bg-slate-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItemId, item.qty + 1)}
                        className="rounded-full border border-slate-300 px-2 py-1 transition hover:bg-slate-50"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.menuItemId)}
                        className="mr-2 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-lg font-bold text-slate-900">
              <span>جمع کل:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              type="button"
              variant="primary"
              disabled={pending || items.length === 0}
              onClick={handleSubmit}
              className="mt-4 w-full"
            >
              {pending ? "در حال پردازش..." : "تکمیل فروش"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
