import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";

/**
 * API route registering a new printer for the authenticated cafe user.
 */
export async function POST(request: Request) {
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const { name, address } = (await request.json()) as { name: string; address: string };

  const existingCount = await prisma.printer.count({ where: { userId: session.userId } });
  if (session.subscriptionTier === "BASIC" && existingCount >= 1) {
    return NextResponse.json({ error: "Basic plan allows only one printer" }, { status: 400 });
  }

  const printer = await prisma.printer.create({
    data: {
      name,
      address,
      userId: session.userId
    }
  });

  return NextResponse.json({ printer });
}
