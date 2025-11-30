"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

/**
 * Client component for Professional plan IPP printing.
 */
export default function IPPPrintButton({ saleId, invoiceUrl }: { saleId: string; invoiceUrl: string }) {
  const [printing, setPrinting] = useState(false);

  return (
    <Button
      variant="primary"
      disabled={printing}
      onClick={async () => {
        setPrinting(true);
        try {
          const res = await fetch("/api/printers/job", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ printerId: "default", fileUrl: invoiceUrl })
          });
          if (!res.ok) {
            alert("ارسال به پرینتر انجام نشد. دوباره تلاش کنید.");
          }
        } catch (error) {
          alert("ارسال به پرینتر انجام نشد. لطفاً اینترنت یا تنظیمات IPP را بررسی کنید.");
        } finally {
          setPrinting(false);
        }
      }}
    >
      {printing ? "در حال چاپ..." : "چاپ از طریق IPP"}
    </Button>
  );
}
