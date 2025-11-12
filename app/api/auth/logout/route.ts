import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * API route clearing the CafePOS session cookie for logout.
 */
export async function POST() {
  const cookieStore = cookies();
  cookieStore.set("cafepos-token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0
  });

  return NextResponse.json({ success: true });
}
