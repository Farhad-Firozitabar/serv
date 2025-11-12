import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/pdf";
import { requirePlan } from "@/lib/subscription";

/**
 * API route creating a sale, recording items, and generating a PDF invoice file.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { items } = body as { items: Array<{ productId: string; qty: number }> };
  if (!items?.length) {
    return NextResponse.json({ error: "No sale items provided" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } }
  });

  const missingProduct = items.find((item) => !products.some((product) => product.id === item.productId));
  if (missingProduct) {
    return NextResponse.json({ error: `Product ${missingProduct.productId} not found` }, { status: 404 });
  }

  const saleItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      productId: item.productId,
      qty: item.qty,
      price: product.price
    };
  });

  const total = saleItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  const sale = await prisma.sale.create({
    data: {
      userId: session.userId,
      total,
      items: { create: saleItems }
    },
    include: { items: true }
  });

  const filePath = await generateInvoicePdf({
    invoiceId: sale.id,
    cafeName: "CafePOS",
    items: sale.items.map((item) => ({
      name: products.find((p) => p.id === item.productId)?.name ?? "Item",
      quantity: item.qty,
      price: Number(item.price)
    })),
    total
  });

  return NextResponse.json({ sale, invoicePath: filePath });
}
