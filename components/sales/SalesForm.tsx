"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import SaleModal from "./SaleModal";
import { formatCurrency } from "@/lib/formatters";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string | null;
}

interface SalesFormProps {
  onSaleCreated?: () => void;
}

/**
 * Sales form component for creating new sales from menu items.
 */
export default function SalesForm({ onSaleCreated }: SalesFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<Array<{ menuItemId: string; qty: number }>>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD_TO_CARD" | "POS">("POS");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdSale, setCreatedSale] = useState<any>(null);

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

  const filteredMenuItems = menuItems.filter((item) => {
    // Filter by category
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    // Filter by search query
    const matchesSearch = searchQuery.trim() === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    
    return matchesCategory && matchesSearch;
  });

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
          phone: phone.trim() || undefined,
          paymentMethod
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Reset form
        setItems([]);
        setPhone("");
        setPaymentMethod("POS");
        // Set created sale and show modal
        setCreatedSale(data.sale);
        setShowModal(true);
        // Trigger refresh event
        window.dispatchEvent(new Event("saleCreated"));
        // Refresh history if callback provided
        if (onSaleCreated) {
          onSaleCreated();
        }
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
    );
  }

  return (
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
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در منو..."
            className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </div>
        {filteredMenuItems.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {searchQuery.trim() ? "نتیجه‌ای یافت نشد" : "آیتمی وجود ندارد"}
          </div>
        ) : (
          <div className="grid gap-2 max-h-[500px] overflow-y-auto">
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
        )}
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

        <div className="grid gap-2">
          <label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700">
            روش پرداخت
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "CARD_TO_CARD" | "POS")}
            className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm"
            disabled={pending}
          >
            <option value="CASH">نقدی</option>
            <option value="CARD_TO_CARD">کارت به کارت</option>
            <option value="POS">دستگاه پوز</option>
          </select>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500">هنوز آیتمی اضافه نشده است.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
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

      {showModal && createdSale && (
        <SaleModal
          sale={createdSale}
          onClose={() => {
            setShowModal(false);
            setCreatedSale(null);
          }}
        />
      )}
    </div>
  );
}
