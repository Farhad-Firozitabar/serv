import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * API route creating a new menu item for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    const session = await requireUser();

    const { name, price, cost, category, materials } = (await request.json()) as {
      name: string;
      price: number;
      cost?: number;
      category?: string;
      materials?: string[];
    };

    if (!name || !price) {
      return NextResponse.json(
        { error: "نام و قیمت الزامی است." },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: "قیمت نمی‌تواند منفی باشد." },
        { status: 400 }
      );
    }

    if (cost !== undefined && cost < 0) {
      return NextResponse.json(
        { error: "هزینه نمی‌تواند منفی باشد." },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        price,
        cost: cost !== undefined ? cost : null,
        category: category?.trim() || null,
        materials: materials || [],
        userId: session.userId
      }
    });

    return NextResponse.json({ menuItem });
  } catch (error: any) {
    console.error("Menu item creation error:", error);
    return NextResponse.json(
      { error: "خطایی در ایجاد آیتم منو رخ داد." },
      { status: 500 }
    );
  }
}

