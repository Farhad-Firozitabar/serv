import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

/**
 * Authentication helpers supporting JWT session cookies and role-based guard utilities.
 */
const JWT_SECRET = process.env.JWT ?? process.env.JWT_SECRET ?? "dev-secret";

export interface SessionPayload {
  userId: string;
  role: "admin" | "user";
  subscriptionTier: "BASIC" | "PROFESSIONAL";
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("sarv-session")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch (error) {
    console.error("Invalid JWT token", error);
    return null;
  }
}

/**
 * Creates a JWT session token for an authenticated user.
 */
export function createSession(userId: string, role: "admin" | "user", subscriptionTier: "BASIC" | "PROFESSIONAL"): string {
  return jwt.sign(
    {
      userId,
      role,
      subscriptionTier
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

/**
 * Requires an authenticated session, throwing if not present.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("دسترسی غیرمجاز");
  }
  return session;
}

/**
 * Requires admin role, throwing if not admin.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    throw new Error("نیاز به نقش مدیر دارد");
  }
  return session;
}

/**
 * Requires non-admin role, redirects admin users to admin panel.
 */
export async function requireUser(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role === "admin") {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard/admin");
  }
  return session;
}
