import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * API route registering a new cafe user with the chosen subscription plan.
 */
export async function POST(request: Request) {
  const { name, email, password, subscriptionTier } = (await request.json()) as {
    name: string;
    email: string;
    password: string;
    subscriptionTier: "BASIC" | "PROFESSIONAL";
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      subscriptionTier,
      role: "user"
    }
  });

  return NextResponse.json({ user });
}
