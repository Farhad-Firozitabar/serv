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
      label: "Basic",
      description: "Sales, simple inventory, and browser printing"
    },
    {
      value: "PROFESSIONAL",
      label: "Professional",
      description: "Advanced inventory, accounting, loyalty, and IPP printing"
    }
  ];

  return (
    <div className="grid gap-3">
      <span className="text-sm font-medium text-slate-700">Subscription plan</span>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(option.value)}
            className={clsx(
              "rounded border p-4 text-left",
              value === option.value ? "border-brand bg-brand/10" : "border-slate-200",
              readOnly ? "cursor-default opacity-75" : "hover:border-brand"
            )}
          >
            <span className="text-base font-semibold">{option.label}</span>
            <p className="text-sm text-slate-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
