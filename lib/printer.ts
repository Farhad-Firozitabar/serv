/**
 * Printer integration helpers handling both browser and IPP-based workflows.
 */

/**
 * Sends a print job to a printer using IPP protocol (Professional plan only).
 * For Basic plan users, use browserPrint() instead.
 */
export async function sendToPrinter(printerId: string, pdfUrl: string) {
  if (!process.env.IPP_ENDPOINT) {
    console.warn("IPP endpoint not configured; skipping remote print job");
    return { success: false, reason: "نشانی سرویس IPP تنظیم نشده است." } as const;
  }

  const response = await fetch(`${process.env.IPP_ENDPOINT}/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ printerId, pdfUrl })
  });

  if (!response.ok) {
    const message = await response.text();
    return { success: false, reason: message } as const;
  }

  return { success: true } as const;
}

/**
 * Browser-based printing helper for Basic plan users.
 * Opens the print dialog for the given PDF URL.
 */
export function browserPrint(pdfUrl: string): void {
  if (typeof window === "undefined") {
    throw new Error("browserPrint can only be called from the client side");
  }

  const printWindow = window.open(pdfUrl, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    // Fallback: try to print the current window if popup blocked
    window.print();
  }
}
