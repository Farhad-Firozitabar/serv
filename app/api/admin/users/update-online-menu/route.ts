import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * API route for enabling or disabling online menu feature for users (admin only).
 */
export async function POST(request: Request) {
  try {
    await requireAdmin(); // Ensure user is admin

    const { userId, hasOnlineMenu } = (await request.json()) as {
      userId: string;
      hasOnlineMenu: boolean;
    };

    if (!userId || typeof hasOnlineMenu !== "boolean") {
      return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { hasOnlineMenu }
    });

    return NextResponse.json({ 
      success: true, 
      user,
      message: hasOnlineMenu ? "منوی آنلاین با موفقیت فعال شد." : "منوی آنلاین با موفقیت غیرفعال شد."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "خطا در به‌روزرسانی منوی آنلاین" },
      { status: 403 }
    );
  }
}

