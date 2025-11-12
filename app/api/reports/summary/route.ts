import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route returning aggregated sales totals for dashboard charts.
 */
export async function GET() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const totalSales = await prisma.sale.aggregate({
    where: { userId: session.userId },
    _sum: { total: true },
    _count: { _all: true }
  });

  return NextResponse.json({
    totalRevenue: totalSales._sum.total ?? 0,
    saleCount: totalSales._count._all
  });
}
