import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route returning detailed analytics for Professional plan users.
 */
export async function GET(request: Request) {
  const { authorized, session, reason } = await requirePlan("PROFESSIONAL");
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: {
    userId: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {
    userId: session.userId
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [sales, topProducts, totalRevenue] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      where: {
        sale: where
      },
      _sum: {
        qty: true
      },
      orderBy: {
        _sum: {
          qty: "desc"
        }
      },
      take: 10
    }),
    prisma.sale.aggregate({
      where,
      _sum: {
        total: true
      },
      _count: {
        _all: true
      }
    })
  ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  const topProductsWithNames = topProducts.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      productName: product?.name ?? "نامشخص",
      totalQuantity: item._sum.qty ?? 0
    };
  });

  return NextResponse.json({
    sales,
    topProducts: topProductsWithNames,
    totalRevenue: totalRevenue._sum.total ?? 0,
    saleCount: totalRevenue._count._all
  });
}
