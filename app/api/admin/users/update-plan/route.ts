import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * API route allowing administrators to update a user's subscription plan.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, subscriptionTier } = (await request.json()) as {
    userId: string;
    subscriptionTier: string;
  };

  if (!userId || !["BASIC", "PROFESSIONAL"].includes(subscriptionTier)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: subscriptionTier as "BASIC" | "PROFESSIONAL" }
  });

  return NextResponse.json({ user: updated });
}
