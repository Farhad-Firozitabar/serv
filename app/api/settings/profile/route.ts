import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * API routes for reading and updating the authenticated cafe profile.
 */
export async function GET() {
  try {
    const session = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        cafeImageUrl: true,
        instagramUrl: true,
        phone: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "حساب کاربری یافت نشد." }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Failed to load cafe profile:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات پروفایل." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireUser();
    const { name, cafeImageUrl, instagramUrl } = (await request.json()) as {
      name?: string;
      cafeImageUrl?: string | null;
      instagramUrl?: string | null;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "نام نمی‌تواند خالی باشد." }, { status: 400 });
    }

    let parsedImageUrl: string | null = null;
    if (cafeImageUrl && cafeImageUrl.trim().length > 0) {
      try {
        const url = new URL(cafeImageUrl.trim());
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("invalid protocol");
        }
        parsedImageUrl = url.toString();
      } catch (error) {
        return NextResponse.json({ error: "لینک تصویر نامعتبر است." }, { status: 400 });
      }
    }

    let parsedInstagramUrl: string | null = null;
    if (instagramUrl && instagramUrl.trim().length > 0) {
      try {
        const url = new URL(instagramUrl.trim());
        if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes("instagram.com")) {
          throw new Error("invalid instagram");
        }
        parsedInstagramUrl = url.toString();
      } catch (error) {
        return NextResponse.json({ error: "لینک اینستاگرام نامعتبر است." }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name.trim(),
        cafeImageUrl: parsedImageUrl,
        instagramUrl: parsedInstagramUrl
      },
      select: {
        name: true,
        cafeImageUrl: true,
        instagramUrl: true
      }
    });

    return NextResponse.json({ profile: updated, message: "پروفایل با موفقیت به‌روزرسانی شد." });
  } catch (error) {
    console.error("Failed to update cafe profile:", error);
    return NextResponse.json({ error: "به‌روزرسانی پروفایل انجام نشد." }, { status: 500 });
  }
}
