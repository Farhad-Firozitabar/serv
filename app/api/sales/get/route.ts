import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route fetching a specific sale by ID with full item details.
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
      },
      user: {
        select: {
          name: true,
          phone: true
        }
      }
    }
  });

  if (!sale || sale.userId !== session.userId) {
    return NextResponse.json({ error: "فروش موردنظر یافت نشد." }, { status: 404 });
  }

  return NextResponse.json({ sale });
}
