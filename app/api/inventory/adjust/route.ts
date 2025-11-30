import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route adjusting raw material inventory quantities with audit logging.
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

  // Check ownership first
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ error: "ماده اولیه موردنظر یافت نشد." }, { status: 404 });
  }

  if (!existing.userId || existing.userId !== session.userId) {
    return NextResponse.json({ error: "شما اجازه تغییر موجودی این ماده اولیه را ندارید." }, { status: 403 });
  }

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
