import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * API route listing all menu items for the authenticated user to use in sales.
 */
export async function GET() {
  const session = await requireUser();

  const menuItems = await prisma.menuItem.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ menuItems });
}

