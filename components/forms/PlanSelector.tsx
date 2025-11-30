"use client";

import clsx from "clsx";

/**
 * Plan selector component toggling between Basic and Professional tiers.
 */
export interface PlanSelectorProps {
  value: "BASIC" | "PROFESSIONAL";
  onChange?: (value: "BASIC" | "PROFESSIONAL") => void;
  readOnly?: boolean;
}

export default function PlanSelector({ value, onChange, readOnly }: PlanSelectorProps) {
  const options: Array<{ value: "BASIC" | "PROFESSIONAL"; label: string; description: string }> = [
    {
      value: "BASIC",
      label: "طرح پایه",
      description: "مدیریت فروش، موجودی ساده، گزارش‌های خلاصه و چاپ مرورگر"
    },
    {
      value: "PROFESSIONAL",
      label: "طرح حرفه‌ای",
      description: "حسابداری پیشرفته، وفادارسازی، چاپ IPP و گزارش تحلیلی"
    }
  ];

  return (
    <div className="grid gap-3 text-right">
      <span className="text-sm font-medium text-slate-700">پلن اشتراک</span>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(option.value)}
            aria-pressed={value === option.value}
            className={clsx(
              "rounded-2xl border p-4 text-right transition",
              value === option.value
                ? "border-brand bg-brand/5 shadow-lg shadow-brand/10"
                : "border-slate-200 hover:border-brand/60 hover:bg-white",
              readOnly ? "cursor-default opacity-75" : "cursor-pointer"
            )}
          >
            <span className="text-base font-bold text-slate-900">{option.label}</span>
            <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
