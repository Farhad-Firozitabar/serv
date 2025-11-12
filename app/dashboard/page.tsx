import { redirect } from "next/navigation";

/**
 * Dashboard index redirecting users to the sales module landing page.
 */
export default function DashboardIndex() {
  redirect("/dashboard/sales");
}
