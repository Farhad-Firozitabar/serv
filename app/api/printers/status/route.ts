import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route exposing the latest print job statuses for the authenticated user.
 */
export async function GET() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const jobs = await prisma.printJob.findMany({
    where: { printer: { userId: session.userId } },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return NextResponse.json({ jobs });
}
