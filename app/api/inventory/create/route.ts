import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route creating a new raw material in the inventory.
 */
export async function POST(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { name, price, stock, stockUnit, category, expirationDate, purchaseDate } = (await request.json()) as {
    name: string;
    price: number;
    stock?: number;
    stockUnit?: string;
    category: string;
    expirationDate?: string;
    purchaseDate?: string;
  };

  if (!name || !price || !category) {
    return NextResponse.json({ error: "نام، قیمت و دسته‌بندی الزامی است." }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      price,
      stock: stock ?? 0,
      stockUnit: stockUnit || null,
      category,
      purchaseDate: purchaseDate || null,
      expirationDate: expirationDate || null,
      userId: session.userId
    }
  });

  if (stock && stock !== 0) {
    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        change: stock,
        reason: "موجودی اولیه"
      }
    });
  }

  return NextResponse.json({ product });
}
