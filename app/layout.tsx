import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

/**
 * Root layout defining shared metadata and theming primitives for the CafePOS App Router tree.
 */
export const metadata: Metadata = {
  title: "CafePOS",
  description: "CafePOS — Modern cafe management platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
