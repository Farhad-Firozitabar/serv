import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route updating an existing raw material in the inventory.
 */
export async function PUT(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { id, name, price, stock, stockUnit, category, expirationDate } = (await request.json()) as {
    id: string;
    name?: string;
    price?: number;
    stock?: number;
    stockUnit?: string | null;
    category?: string;
    expirationDate?: string | null;
  };

  if (!id) {
    return NextResponse.json({ error: "شناسه ماده اولیه الزامی است." }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "ماده اولیه موردنظر یافت نشد." }, { status: 404 });
  }

  // Check ownership
  if (!existing.userId || existing.userId !== session.userId) {
    return NextResponse.json({ error: "شما اجازه ویرایش این ماده اولیه را ندارید." }, { status: 403 });
  }

  const updateData: {
    name?: string;
    price?: number;
    stock?: number;
    stockUnit?: string | null;
    category?: string;
    expirationDate?: string | null;
  } = {};

  if (name !== undefined) updateData.name = name;
  if (price !== undefined) updateData.price = price;
  if (category !== undefined) updateData.category = category;
  if (stockUnit !== undefined) updateData.stockUnit = stockUnit || null;
  if (expirationDate !== undefined) updateData.expirationDate = expirationDate || null;

  if (stock !== undefined && stock !== existing.stock) {
    const change = stock - existing.stock;
    updateData.stock = stock;

    await prisma.inventoryLog.create({
      data: {
        productId: id,
        change,
        reason: "اصلاح دستی"
      }
    });
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json({ product });
}
