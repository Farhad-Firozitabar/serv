"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import jalaali from "jalaali-js";

interface InventoryLog {
  id: string;
  change: number;
  reason: string;
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  stockUnit: string | null;
  purchaseDate: string | null;
  expirationDate: string | null;
  logs: InventoryLog[];
}

interface InventoryListProps {
  products: Product[];
}

/**
 * Client component for displaying inventory items with delete functionality.
 */
export default function InventoryList({ products: initialProducts }: InventoryListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (productId: string) => {
    if (!confirm("آیا از حذف این ماده اولیه اطمینان دارید؟")) {
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/inventory/delete?id=${productId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "خطا در حذف ماده اولیه");
      }
    });
  };

  const hasProducts = products.length > 0;

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      return nameMatch || categoryMatch;
    });
  }, [products, searchTerm]);

  if (!hasProducts) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-8 text-center">
        <p className="text-sm text-slate-500">
          هنوز ماده اولیه‌ای ثبت نشده است. از دکمه «افزودن ماده اولیه جدید» برای افزودن مواد اولیه استفاده کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-emerald-50 bg-white/80 p-4 shadow-sm shadow-emerald-50 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">جستجوی مواد اولیه</p>
          <p className="text-xs text-slate-500">نام یا دسته‌بندی را وارد کنید.</p>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="مثلاً قهوه یا نوشیدنی گرم"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner focus:border-emerald-400 focus:outline-none md:w-64"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500">
          نتیجه‌ای مطابق جستجو یافت نشد.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProducts.map((product) => {
            // Calculate expiration timing details
            const expirationDetails = product.expirationDate
              ? (() => {
                  try {
                    const [year, month, day] = product.expirationDate.split("/").map(Number);
                    const gregorian = jalaali.jalaaliToGregorian(year, month, day);
                    const expDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const diffTime = expDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return {
                      isExpired: diffDays < 0,
                      isExpiringSoon: diffDays >= 0 && diffDays <= 30,
                      diffDays
                    };
                  } catch {
                    return null;
                  }
                })()
              : null;
            
            const isExpired = expirationDetails?.isExpired ?? false;
            const isExpiringSoon = expirationDetails?.isExpiringSoon ?? false;

            return (
              <article 
                key={product.id} 
                className={`rounded-3xl border bg-white/95 p-5 shadow-sm ${
                  isExpired 
                    ? "border-red-200 shadow-red-50" 
                    : isExpiringSoon 
                    ? "border-orange-200 shadow-orange-50" 
                    : "border-emerald-100 shadow-emerald-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span className="font-bold text-slate-900">{product.name}</span>
                      <span>
                        موجودی: {product.stock} {product.stockUnit ? product.stockUnit : ""}
                      </span>
                    </div>
                    {product.expirationDate && expirationDetails && (
                      <div className={`mt-2 text-sm font-medium ${
                        isExpired 
                          ? "text-red-600" 
                          : isExpiringSoon 
                          ? "text-orange-600" 
                          : "text-slate-600"
                      }`}>
                        تاریخ انقضا: {product.expirationDate}
                        {isExpired ? (
                          <span className="mr-2 text-xs">
                            ({Math.abs(expirationDetails.diffDays)} روز از انقضا گذشته)
                          </span>
                        ) : (
                          <span className="mr-2 text-xs">
                            ({expirationDetails.diffDays} روز تا انقضا)
                          </span>
                        )}
                      </div>
                    )}
                    {product.purchaseDate && (
                      <div className="mt-2 text-sm text-slate-600">
                        تاریخ خرید: {product.purchaseDate}
                      </div>
                    )}
                    <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                      {product.logs.map((log) => (
                        <li key={log.id}>
                          {log.change > 0 ? "+" : ""}
                          {log.change} — {log.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    disabled={pending}
                    className="mr-4 rounded-xl border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
