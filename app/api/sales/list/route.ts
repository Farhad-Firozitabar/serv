import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route listing recent sales for the authenticated user.
 */
export async function GET() {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const sales = await prisma.sale.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    }
  });

  // Serialize Decimal values to numbers for client components
  const serializedSales = sales.map((sale) => ({
    ...sale,
    total: Number(sale.total),
    items: sale.items.map((item) => ({
      ...item,
      price: Number(item.price),
      menuItem: item.menuItem ? {
        ...item.menuItem,
        price: Number(item.menuItem.price),
        cost: item.menuItem.cost ? Number(item.menuItem.cost) : null
      } : null
    }))
  }));

  return NextResponse.json({ sales: serializedSales });
}

