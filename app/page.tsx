import Link from "next/link";

/**
 * Marketing splash page guiding users to authenticate into the CafePOS dashboard.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-brand">CafePOS</h1>
      <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
        Manage your café&apos;s sales, inventory, accounting, and customer loyalty with role-based access and plan-aware features.
      </p>
      <div className="flex gap-4">
        <Link className="rounded bg-brand px-4 py-2 font-semibold text-white" href="/(auth)/login">
          Sign in
        </Link>
        <Link className="rounded border border-brand px-4 py-2 font-semibold text-brand" href="/(auth)/register">
          Create account
        </Link>
      </div>
    </main>
  );
}
