"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقدی",
  CARD_TO_CARD: "کارت به کارت",
  POS: "دستگاه پوز"
};

export default function PaymentMethodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("paymentMethod") || "all";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("paymentMethod");
    } else {
      params.set("paymentMethod", value);
    }
    router.push(`/dashboard/accounting?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm shadow-slate-100">
      <div className="flex items-center gap-3">
        <label htmlFor="paymentMethodFilter" className="text-sm font-medium text-slate-700">
          فیلتر روش پرداخت:
        </label>
        <select
          id="paymentMethodFilter"
          value={currentFilter}
          onChange={(e) => handleChange(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
        >
          <option value="all">همه</option>
          <option value="CASH">نقدی</option>
          <option value="CARD_TO_CARD">کارت به کارت</option>
          <option value="POS">دستگاه پوز</option>
        </select>
      </div>
      {currentFilter !== "all" && (
        <p className="text-sm text-slate-600">
          نمایش: <span className="font-semibold text-slate-900">{PAYMENT_METHOD_LABELS[currentFilter]}</span>
        </p>
      )}
    </div>
  );
}

