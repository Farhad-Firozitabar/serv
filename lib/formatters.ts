const persianCurrencyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0
});

/**
 * Formats numeric values as Persian currency (ریال) without decimals.
 */
export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "۰ ریال";
  }
  return `${persianCurrencyFormatter.format(Math.round(Number(value)))} ریال`;
}
