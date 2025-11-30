import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * API route handling سرو credential-based login and issuing JWT session cookies.
 */
export async function POST(request: Request) {
  const { phone, password } = (await request.json()) as { phone: string; password: string };
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ error: "شماره تلفن یا رمز عبور نادرست است." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "شماره تلفن یا رمز عبور نادرست است." }, { status: 401 });
  }

  if (!user.active && user.role !== "admin") {
    return NextResponse.json({ error: "حساب شما هنوز فعال نشده است. لطفاً منتظر تایید مدیر باشید." }, { status: 403 });
  }

  const { createSession } = await import("@/lib/auth");
  const token = createSession(user.id, user.role, user.subscriptionTier);

  const cookieStore = cookies();
  cookieStore.set("sarv-session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return NextResponse.json({ success: true, role: user.role, subscriptionTier: user.subscriptionTier });
}
