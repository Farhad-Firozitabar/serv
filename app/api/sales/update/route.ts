import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route for updating a sale's payment method.
 */
export async function PATCH(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const body = await request.json();
  const { saleId, paymentMethod } = body as {
    saleId: string;
    paymentMethod: "CASH" | "CARD_TO_CARD" | "POS";
  };

  if (!saleId || !paymentMethod) {
    return NextResponse.json({ error: "شناسه فروش و روش پرداخت الزامی است." }, { status: 400 });
  }

  if (!["CASH", "CARD_TO_CARD", "POS"].includes(paymentMethod)) {
    return NextResponse.json({ error: "روش پرداخت نامعتبر است." }, { status: 400 });
  }

  // Verify the sale belongs to the user
  const sale = await prisma.sale.findFirst({
    where: {
      id: saleId,
      userId: session.userId
    }
  });

  if (!sale) {
    return NextResponse.json({ error: "فروش یافت نشد." }, { status: 404 });
  }

  // Update the payment method
  const updatedSale = await prisma.sale.update({
    where: { id: saleId },
    data: { paymentMethod },
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    }
  });

  // Serialize Decimal values to numbers for client components
  const serializedSale = {
    ...updatedSale,
    total: Number(updatedSale.total),
    tax: Number(updatedSale.tax),
    items: updatedSale.items.map((item) => ({
      ...item,
      price: Number(item.price),
      menuItem: item.menuItem ? {
        ...item.menuItem,
        price: Number(item.menuItem.price),
        cost: item.menuItem.cost ? Number(item.menuItem.cost) : null
      } : null
    }))
  };

  return NextResponse.json({ sale: serializedSale });
}

