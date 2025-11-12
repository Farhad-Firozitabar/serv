import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendToPrinter } from "@/lib/printer";
import { requirePlan } from "@/lib/subscription";

/**
 * API route queuing a print job for a registered CafePOS printer.
 */
export async function POST(request: Request) {
  const { authorized, session, reason } = await requirePlan("PROFESSIONAL");
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { printerId, fileUrl } = await request.json();

  const printer = await prisma.printer.findUnique({ where: { id: printerId } });
  if (!printer || printer.userId !== session.userId) {
    return NextResponse.json({ error: "Printer not found" }, { status: 404 });
  }

  const job = await prisma.printJob.create({
    data: {
      printerId,
      fileUrl,
      status: "PENDING"
    }
  });

  const result = await sendToPrinter(printerId, fileUrl);

  if (!result.success) {
    await prisma.printJob.update({
      where: { id: job.id },
      data: { status: "FAILED" }
    });
    return NextResponse.json({ jobId: job.id, status: "FAILED", reason: result.reason }, { status: 500 });
  }

  await prisma.printJob.update({
    where: { id: job.id },
    data: { status: "SENT" }
  });

  return NextResponse.json({ jobId: job.id, status: "SENT" });
}
