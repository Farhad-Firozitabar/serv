import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

/**
 * API route handling CafePOS credential-based login and issuing JWT session cookies.
 */
export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await authenticate(email, user.passwordHash);
  if (!token) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }

  const cookieStore = cookies();
  cookieStore.set("cafepos-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return NextResponse.json({ success: true, role: user.role, subscriptionTier: user.subscriptionTier });
}
