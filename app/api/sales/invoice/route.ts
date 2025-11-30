import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { generateInvoicePdf } from "@/lib/pdf";

/**
 * API route generating and returning an invoice PDF for a specific sale.
 */
export async function GET(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const saleId = searchParams.get("id");

  if (!saleId) {
    return NextResponse.json({ error: "شناسه فروش الزامی است." }, { status: 400 });
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!sale || sale.userId !== session.userId) {
    return NextResponse.json({ error: "این فروش یافت نشد." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true }
  });

  const filePath = await generateInvoicePdf({
    invoiceId: sale.id,
    cafeName: user?.name ?? "سرو",
    items: sale.items.map((item) => ({
      name: item.product.name,
      quantity: item.qty,
      price: Number(item.price)
    })),
    total: Number(sale.total)
  });

  const relativePath = filePath.replace(process.cwd() + "/public", "");
  return NextResponse.json({ invoiceUrl: relativePath });
}
