import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route listing all printers registered by the authenticated user.
 */
export async function GET() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const printers = await prisma.printer.findMany({
    where: { userId: session.userId },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ printers });
}

