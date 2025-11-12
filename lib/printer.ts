/**
 * Printer integration helpers handling both browser and IPP-based workflows.
 */
export async function sendToPrinter(printerId: string, pdfUrl: string) {
  if (!process.env.IPP_ENDPOINT) {
    console.warn("IPP endpoint not configured; skipping remote print job");
    return { success: false, reason: "IPP endpoint missing" } as const;
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
