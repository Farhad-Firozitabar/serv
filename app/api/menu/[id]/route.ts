import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * API route for updating and deleting menu items.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUser();
    const { name, price, cost, category, materials } = (await request.json()) as {
      name?: string;
      price?: number;
      cost?: number;
      category?: string;
      materials?: string[];
    };

    // Check if menu item exists and belongs to user
    const existing = await prisma.menuItem.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "آیتم منو یافت نشد." },
        { status: 404 }
      );
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز." },
        { status: 403 }
      );
    }

    if (price !== undefined && price < 0) {
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

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price }),
        ...(cost !== undefined && { cost: cost !== null ? cost : null }),
        ...(category !== undefined && { category: category?.trim() || null }),
        ...(materials !== undefined && { materials })
      }
    });

    return NextResponse.json({ menuItem });
  } catch (error: any) {
    console.error("Menu item update error:", error);
    return NextResponse.json(
      { error: "خطایی در به‌روزرسانی آیتم منو رخ داد." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUser();

    // Check if menu item exists and belongs to user
    const existing = await prisma.menuItem.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "آیتم منو یافت نشد." },
        { status: 404 }
      );
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز." },
        { status: 403 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Menu item deletion error:", error);
    return NextResponse.json(
      { error: "خطایی در حذف آیتم منو رخ داد." },
      { status: 500 }
    );
  }
}

