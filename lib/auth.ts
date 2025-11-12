import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

/**
 * Authentication helpers supporting JWT session cookies and role-based guard utilities.
 */
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export interface SessionPayload {
  userId: string;
  role: "admin" | "user";
  subscriptionTier: "BASIC" | "PROFESSIONAL";
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("cafepos-token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch (error) {
    console.error("Invalid JWT token", error);
    return null;
  }
}

export async function authenticate(email: string, passwordHash: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.passwordHash !== passwordHash) {
    return null;
  }
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      subscriptionTier: user.subscriptionTier
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
}
