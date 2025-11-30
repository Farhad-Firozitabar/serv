import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * API route registering a new cafe user with the chosen subscription plan.
 */
export async function POST(request: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return NextResponse.json(
        { error: "درخواست نامعتبر است. لطفاً دوباره تلاش کنید." },
        { status: 400 }
      );
    }

    const { name, phone, password, subscriptionTier } = body as {
      name: string;
      phone: string;
      password: string;
      subscriptionTier: "BASIC" | "PROFESSIONAL";
    };

    // Validate required fields
    if (!name || !phone || !password || !subscriptionTier) {
      return NextResponse.json(
        { error: "لطفاً همه فیلدها را تکمیل کنید." },
        { status: 400 }
      );
    }

    // Validate subscription tier
    if (subscriptionTier !== "BASIC" && subscriptionTier !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "نوع اشتراک نامعتبر است." },
        { status: 400 }
      );
    }

    // Validate phone number format (Iranian phone numbers: 09XXXXXXXXX or +98XXXXXXXXXX)
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, ""); // Remove whitespace
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "فرمت شماره تلفن نامعتبر است. لطفاً شماره را به صورت 09123456789 وارد کنید." },
        { status: 400 }
      );
    }

    // Normalize phone number (remove leading +98 or 0, add 0)
    const normalizedPhone = cleanPhone.startsWith("+98")
      ? "0" + cleanPhone.slice(3)
      : cleanPhone.startsWith("0")
      ? cleanPhone
      : "0" + cleanPhone;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (existing) {
      return NextResponse.json(
        { error: "این شماره تلفن قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        phone: normalizedPhone,
        passwordHash,
        subscriptionTier,
        role: "user",
        active: false // New users are inactive until admin activates them
      }
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, phone: user.phone },
      message: "حساب شما با موفقیت ایجاد شد. لطفاً منتظر تایید مدیر باشید."
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "این شماره تلفن قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error.message?.includes("pattern") || error.message?.includes("SyntaxError")) {
      console.error("Database connection error - check DATABASE_URL:", error);
      return NextResponse.json(
        { error: "خطا در اتصال به پایگاه داده. لطفاً با مدیر سیستم تماس بگیرید." },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
