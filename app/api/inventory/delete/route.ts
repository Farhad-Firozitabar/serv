import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route deleting a raw material from the inventory.
 */
export async function DELETE(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.json({ error: "شناسه ماده اولیه الزامی است." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      saleItems: true
    }
  });

  if (!product) {
    return NextResponse.json({ error: "ماده اولیه موردنظر یافت نشد." }, { status: 404 });
  }

  // Check ownership
  if (!product.userId || product.userId !== session.userId) {
    return NextResponse.json({ error: "شما اجازه حذف این ماده اولیه را ندارید." }, { status: 403 });
  }

  if (product.saleItems.length > 0) {
    return NextResponse.json(
      { error: "امکان حذف ماده اولیه دارای فروش ثبت‌شده وجود ندارد. آن را غیرفعال کنید." },
      { status: 400 }
    );
  }

  await prisma.inventoryLog.deleteMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } });

  return NextResponse.json({ success: true });
}
