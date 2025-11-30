import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Dashboard index redirecting users based on their role.
 */
export default async function DashboardIndex() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/sales");
}
