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

  return (
    <article className="flex flex-col gap-3 rounded border border-slate-200 p-4 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold">{printer.name}</h2>
        <p className="text-sm text-slate-500">{printer.address}</p>
      </header>
      <div className="text-sm text-slate-600">
        <p>Registered: {new Date(printer.createdAt).toLocaleString()}</p>
        {latestJob ? <p>Last job: {latestJob.status}</p> : <p>No jobs yet</p>}
      </div>
      <Button variant="secondary">Send test print</Button>
    </article>
  );
}
