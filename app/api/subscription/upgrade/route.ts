import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * API route allowing users to request a plan upgrade (admin approval required).
 * Note: In production, this would integrate with a payment processor.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const { subscriptionTier } = (await request.json()) as {
    subscriptionTier: "BASIC" | "PROFESSIONAL";
  };

  if (!["BASIC", "PROFESSIONAL"].includes(subscriptionTier)) {
    return NextResponse.json({ error: "پلن انتخابی معتبر نیست." }, { status: 400 });
  }

  // Only allow upgrades, not downgrades (admin must handle downgrades)
  if (session.subscriptionTier === "PROFESSIONAL" && subscriptionTier === "BASIC") {
    return NextResponse.json(
      { error: "کاهش پلن تنها توسط مدیر سامانه انجام می‌شود." },
      { status: 400 }
    );
  }

  // In a real app, this would process payment and then update
  // For now, we'll just return a message that admin approval is needed
  return NextResponse.json({
    message: "درخواست ارتقا ثبت شد. مدیر سامانه آن را بررسی و تأیید خواهد کرد.",
    requestedTier: subscriptionTier
  });
}
