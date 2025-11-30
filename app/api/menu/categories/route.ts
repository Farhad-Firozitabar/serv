import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * API route listing all unique categories used by the authenticated user's menu items.
 */
export async function GET() {
  const session = await requireUser();

  const menuItems = await prisma.menuItem.findMany({
    where: { userId: session.userId },
    select: { category: true }
  });

  // Extract unique categories, filter out null/empty values
  const categories = Array.from(
    new Set(
      menuItems
        .map((item) => item.category)
        .filter((cat): cat is string => Boolean(cat))
    )
  ).sort();

  return NextResponse.json({ categories });
}

