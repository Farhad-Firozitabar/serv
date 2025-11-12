import { NextResponse } from "next/server";
import { requirePlan } from "@/lib/subscription";

/**
 * API route verifying whether the current session meets a subscription requirement.
 */
export async function POST(request: Request) {
  const { plan } = (await request.json()) as { plan: "BASIC" | "PROFESSIONAL" };
  const { authorized, reason, session } = await requirePlan(plan);
  if (!authorized || !session) {
    return NextResponse.json({ authorized: false, reason }, { status: 403 });
  }

  return NextResponse.json({ authorized: true, subscriptionTier: session.subscriptionTier });
}
