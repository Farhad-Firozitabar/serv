import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import PrinterCard from "@/components/printers/PrinterCard";

/**
 * Printers dashboard allowing users to review and register printing devices.
 */
export default async function PrintersPage() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="text-red-500">Access denied: {reason}</p>;
  }

  const printers = await prisma.printer.findMany({
    where: { userId: session.userId },
    include: { jobs: true }
  });

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Printers</h1>
          <p className="text-sm text-slate-500">Manage receipt printers connected to your cafe.</p>
        </div>
        <Link className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white" href="#">
          Register printer
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {printers.map((printer) => (
          <PrinterCard key={printer.id} printer={printer} />
        ))}
      </div>
    </section>
  );
}
