import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * API route listing all menu items for the authenticated user.
 */
export async function GET() {
  const session = await requireUser();

  const menuItems = await prisma.menuItem.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ menuItems });
}

