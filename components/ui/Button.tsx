"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

/**
 * Reusable button component reflecting shadcn/ui-inspired styling variants.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "bg-brand text-white hover:bg-brand-dark focus:ring-brand",
    secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus:ring-slate-300",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-200"
  } satisfies Record<Required<ButtonProps>["variant"], string>;

  return <button className={clsx(base, variantClasses[variant], className)} {...props} />;
}
