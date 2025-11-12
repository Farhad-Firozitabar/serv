import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route adjusting inventory quantities with audit logging.
 */
export async function POST(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { productId, change, reason: note } = (await request.json()) as {
    productId: string;
    change: number;
    reason: string;
  };

  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock: { increment: change } }
  });

  await prisma.inventoryLog.create({
    data: {
      productId,
      change,
      reason: note
    }
  });

  return NextResponse.json({ product });
}
