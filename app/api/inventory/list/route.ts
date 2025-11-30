import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route listing all raw materials in inventory.
 */
export async function GET() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ products });
}

