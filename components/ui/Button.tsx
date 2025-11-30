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
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const variantClasses = {
    primary: "bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-dark",
    secondary: "border border-brand/30 bg-white/90 text-brand-dark hover:bg-brand/5",
    ghost: "text-brand hover:text-brand-dark hover:bg-brand/10"
  } satisfies Record<Required<ButtonProps>["variant"], string>;

  return <button className={clsx(base, variantClasses[variant], className)} {...props} />;
}
