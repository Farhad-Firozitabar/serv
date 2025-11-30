import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildMenuShareSlug } from "@/lib/menuShare";

/**
 * Returns the shareable slug for the authenticated cafe along with display metadata.
 */
export async function GET() {
  try {
    const session = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        cafeImageUrl: true,
        instagramUrl: true,
        hasOnlineMenu: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "حساب کاربری یافت نشد." }, { status: 404 });
    }

    if (!user.hasOnlineMenu) {
      return NextResponse.json({ error: "منوی آنلاین برای شما فعال نشده است. لطفاً با مدیر سیستم تماس بگیرید." }, { status: 403 });
    }

    const shareSlug = buildMenuShareSlug(user.name, user.id);
    return NextResponse.json({
      shareSlug,
      cafeName: user.name,
      cafeImageUrl: user.cafeImageUrl,
      instagramUrl: user.instagramUrl,
      hasOnlineMenu: user.hasOnlineMenu
    });
  } catch (error) {
    console.error("Failed to create menu share slug:", error);
    return NextResponse.json({ error: "امکان تهیه لینک اشتراک‌گذاری وجود ندارد." }, { status: 500 });
  }
}
