"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

/**
 * Client component for Basic plan browser printing.
 */
export default function PrintButton({ invoiceUrl }: { invoiceUrl: string }) {
  return (
    <Button
      variant="primary"
      onClick={() => {
        const printWindow = window.open(invoiceUrl, "_blank");
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
      }}
    >
      چاپ مرورگر
    </Button>
  );
}
