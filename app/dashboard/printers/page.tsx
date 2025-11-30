import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import PrinterCard from "@/components/printers/PrinterCard";

/**
 * Printers dashboard allowing users to review and register printing devices.
 */
export default async function PrintersPage() {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const printers = await prisma.printer.findMany({
    where: { userId: session.userId },
    include: { jobs: true }
  });

  return (
    <section className="space-y-6 text-right">
      <header className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">پرینترها</h1>
          <p className="text-sm text-slate-500">پرینترهای فیش و رسید خود را مدیریت کنید و وضعیت آخرین چاپ را ببینید.</p>
        </div>
        <Link className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30" href="#">
          ثبت پرینتر جدید
        </Link>
      </header>
      {printers.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-6 text-sm text-slate-500">
          هنوز پرینتری ثبت نشده است. از دکمه «ثبت پرینتر جدید» برای افزودن دستگاه استفاده کنید.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {printers.map((printer) => (
            <PrinterCard key={printer.id} printer={printer} />
          ))}
        </div>
      )}
    </section>
  );
}
