import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import jalaali from "jalaali-js";

/**
 * API route listing sales for the authenticated user with date filtering and pagination.
 */
export async function GET(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startDate = searchParams.get("startDate"); // Format: YYYY/MM/DD (Persian)
  const endDate = searchParams.get("endDate"); // Format: YYYY/MM/DD (Persian)

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { userId: session.userId };

  // Convert Persian dates to JavaScript dates for filtering
  if (startDate || endDate) {
    where.createdAt = {};
    
    if (startDate) {
      const [year, month, day] = startDate.split("/").map(Number);
      const gregorian = jalaali.jalaaliToGregorian(year, month, day);
      const start = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, 0, 0, 0, 0);
      where.createdAt.gte = start;
    }
    
    if (endDate) {
      const [year, month, day] = endDate.split("/").map(Number);
      const gregorian = jalaali.jalaaliToGregorian(year, month, day);
      const end = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, 23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  // Get total count for pagination
  const total = await prisma.sale.count({ where });

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
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
    tax: Number(sale.tax),
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

  return NextResponse.json({ 
    sales: serializedSales,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

