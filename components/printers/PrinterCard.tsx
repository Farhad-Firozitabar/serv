"use client";

import Button from "@/components/ui/Button";
import type { Printer, PrintJob } from "@prisma/client";

/**
 * Card component summarising a printer and its latest job status.
 */
export interface PrinterCardProps {
  printer: Printer & { jobs: PrintJob[] };
}

export default function PrinterCard({ printer }: PrinterCardProps) {
  const latestJob = printer.jobs[0];
  const statusMap: Record<PrintJob["status"], string> = {
    PENDING: "در انتظار",
    SENT: "ارسال شد",
    FAILED: "ناموفق"
  };

  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white/95 p-5 text-right shadow-sm shadow-emerald-50">
      <header>
        <h2 className="text-lg font-bold text-slate-900">{printer.name}</h2>
        <p className="text-sm text-slate-500">{printer.address}</p>
      </header>
      <div className="text-sm text-slate-600">
        <p>تاریخ ثبت: {new Date(printer.createdAt).toLocaleString("fa-IR")}</p>
        {latestJob ? <p>آخرین چاپ: {statusMap[latestJob.status]}</p> : <p>هنوز چاپی ثبت نشده است</p>}
      </div>
      <Button variant="secondary">چاپ آزمایشی</Button>
    </article>
  );
}
