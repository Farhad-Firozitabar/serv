import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";

/**
 * Root layout defining shared metadata and theming primitives for سرو.
 */
export const metadata: Metadata = {
  title: "سرو — سامانه مدیریت کافه",
  description: "سرو؛ راهکار یکپارچه و فارسی برای مدیریت فروش، موجودی و مشتریان کافه"
};

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vazirmatn",
  display: "swap"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.className} min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 text-slate-900 antialiased dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900`}
      >
        {children}
      </body>
    </html>
  );
}
