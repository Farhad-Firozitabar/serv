const persianCurrencyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0
});

/**
 * Formats numeric values as Persian currency (تومان) without decimals.
 */
export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "۰ تومان";
  }
  return `${persianCurrencyFormatter.format(Math.round(Number(value)))} تومان`;
}
