import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/pdf";
import { requirePlan } from "@/lib/subscription";

/**
 * API route creating a sale, recording items, and generating a PDF invoice file.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true }
  });

  const { items, phone, paymentMethod } = body as {
    items: Array<{ menuItemId: string; qty: number }>;
    phone?: string;
    paymentMethod?: "CASH" | "CARD_TO_CARD" | "POS";
  };

  if (!items?.length) {
    return NextResponse.json({ error: "هیچ آیتمی برای فاکتور ارسال نشده است." }, { status: 400 });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((item) => item.menuItemId) },
      userId: session.userId
    }
  });

  const missingMenuItem = items.find((item) => !menuItems.some((menuItem) => menuItem.id === item.menuItemId));
  if (missingMenuItem) {
    return NextResponse.json({ error: `آیتم منو با شناسه ${missingMenuItem.menuItemId} یافت نشد.` }, { status: 404 });
  }

  const saleItems = items.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
    return {
      menuItemId: item.menuItemId,
      qty: item.qty,
      price: menuItem.price
    };
  });

  const total = saleItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  // Normalize phone number if provided
  let normalizedPhone: string | null = null;
  if (phone) {
    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (phoneRegex.test(cleanPhone)) {
      normalizedPhone = cleanPhone.startsWith("+98")
        ? "0" + cleanPhone.slice(3)
        : cleanPhone.startsWith("0")
        ? cleanPhone
        : "0" + cleanPhone;
    }
  }

  const sale = await prisma.sale.create({
    data: {
      userId: session.userId,
      total,
      phone: normalizedPhone,
      paymentMethod: paymentMethod || "POS",
      items: { create: saleItems }
    },
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    }
  });

  // Serialize Decimal values to numbers for client components
  const serializedSale = {
    ...sale,
    total: Number(sale.total),
    items: sale.items.map((item) => ({
      ...item,
      price: Number(item.price),
      menuItem: item.menuItem ? {
        ...item.menuItem,
        price: Number(item.menuItem.price),
        cost: item.menuItem.cost ? Number(item.menuItem.cost) : null
      } : null
    }))
  };

  // Generate PDF asynchronously (don't block response if it fails)
  let filePath: string | null = null;
  try {
    filePath = await generateInvoicePdf({
      invoiceId: sale.id,
      cafeName: user?.name ?? "سرو",
      items: sale.items.map((item) => ({
        name: item.menuItem?.name ?? "آیتم",
        quantity: item.qty,
        price: Number(item.price)
      })),
      total,
      phone: normalizedPhone || undefined
    });
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    // Continue without PDF - sale is still created
  }

  return NextResponse.json({ sale: serializedSale, invoicePath: filePath });
}
