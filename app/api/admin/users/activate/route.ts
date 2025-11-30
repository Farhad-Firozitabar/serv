import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * API route for activating or deactivating users (admin only).
 */
export async function POST(request: Request) {
  try {
    await requireAdmin(); // Ensure user is admin

    const { userId, active } = (await request.json()) as {
      userId: string;
      active: boolean;
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: { active }
    });

    return NextResponse.json({ 
      success: true, 
      user,
      message: active ? "کاربر با موفقیت فعال شد." : "کاربر با موفقیت غیرفعال شد."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "خطا در به‌روزرسانی وضعیت کاربر" },
      { status: 403 }
    );
  }
}

