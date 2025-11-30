"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";

const beautifulMessages = [
  "امیدواریم لحظات خوشی را در کنار ما تجربه کرده باشید",
  "از حضور گرم شما سپاسگزاریم",
  "امیدواریم روز خوبی داشته باشید",
  "خوشحالیم که میزبان شما بودیم",
  "امیدواریم دوباره شما را ببینیم",
  "از انتخاب شما متشکریم",
  "امیدواریم از خدمات ما راضی بوده باشید",
  "خوشحالیم که در کنار شما بودیم",
  "امیدواریم لحظات شیرینی را با ما گذرانده باشید",
  "از اعتماد شما به ما سپاسگزاریم"
];

interface SaleItem {
  id: string;
  qty: number;
  price: number;
  menuItem: {
    name: string;
  } | null;
}

interface SaleModalProps {
  sale: {
    id: string;
    total: number;
    tax?: number;
    phone: string | null;
    createdAt: Date | string;
    items: SaleItem[];
  };
  onClose: () => void;
}

/**
 * Modal component showing sale preview with edit and print options.
 */
export default function SaleModal({ sale, onClose }: SaleModalProps) {
  const router = useRouter();
  const randomMessage = useMemo(() => {
    return beautifulMessages[Math.floor(Math.random() * beautifulMessages.length)];
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
          <head>
            <meta charset="UTF-8">
            <title>فاکتور ${sale.id.slice(0, 8)}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Vazirmatn', 'Tahoma', sans-serif;
                padding: 20px;
                background: white;
                color: #000000;
                line-height: 1.6;
                font-weight: bold;
              }
              .receipt {
                max-width: 300px;
                margin: 0 auto;
                background: white;
                border: 2px solid #000000;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #000000;
                padding-bottom: 16px;
                margin-bottom: 20px;
              }
              .header h1 {
                font-size: 24px;
                font-weight: 900;
                color: #000000;
                margin-bottom: 8px;
              }
              .info {
                margin-bottom: 20px;
                font-size: 11px;
                color: #000000;
                font-weight: bold;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
              }
              .items {
                margin-bottom: 20px;
              }
              .item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px dotted #000000;
              }
              .item-name {
                flex: 1;
                font-weight: bold;
                color: #000000;
              }
              .item-details {
                text-align: left;
                font-size: 11px;
                color: #000000;
                font-weight: bold;
              }
              .total {
                border-top: 2px solid #000000;
                padding-top: 12px;
                margin-top: 12px;
                display: flex;
                justify-content: space-between;
                font-size: 18px;
                font-weight: 900;
                color: #000000;
              }
              .footer {
                text-align: center;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #000000;
                font-size: 11px;
                color: #000000;
                font-weight: bold;
              }
              @media print {
                body { padding: 0; }
                .receipt { border: none; box-shadow: none; max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h1>سرو</h1>
                <p>فاکتور فروش</p>
              </div>
              <div class="info">
                <div class="info-row">
                  <span>شماره فاکتور:</span>
                  <span>${sale.id.slice(0, 8)}</span>
                </div>
                ${sale.phone ? `
                <div class="info-row">
                  <span>شماره تماس:</span>
                  <span>${sale.phone}</span>
                </div>
                ` : ""}
                <div class="info-row">
                  <span>تاریخ:</span>
                  <span>${new Date(sale.createdAt).toLocaleDateString("fa-IR")}</span>
                </div>
                <div class="info-row">
                  <span>زمان:</span>
                  <span>${new Date(sale.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
              <div class="items">
                ${sale.items.map((item) => `
                  <div class="item">
                    <span class="item-name">${item.menuItem?.name || "آیتم"}</span>
                    <div class="item-details">
                      <div>${item.qty} × ${formatCurrency(item.price)}</div>
                      <div style="font-weight: 600; margin-top: 2px;">${formatCurrency(item.price * item.qty)}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
              ${sale.tax !== undefined ? `
              <div style="border-top: 1px solid #000000; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
                <span>جمع کل:</span>
                <span>${formatCurrency(sale.total - sale.tax)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-top: 4px;">
                <span>مالیات (۹٪):</span>
                <span>${formatCurrency(sale.tax)}</span>
              </div>
              ` : ""}
              <div class="total">
                <span>مبلغ قابل پرداخت:</span>
                <span>${formatCurrency(sale.total)}</span>
              </div>
              <div class="footer">
                <p style="margin-bottom: 8px;">با تشکر از خرید شما</p>
                <p style="margin-bottom: 8px; font-size: 11px;">${randomMessage}</p>
                <p style="margin-top: 8px; font-size: 10px;">سرو - سیستم مدیریت کافه</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl border border-emerald-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">فاکتور #{sale.id.slice(0, 8)}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              ×
            </button>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            <p>تاریخ: {new Date(sale.createdAt).toLocaleString("fa-IR")}</p>
            {sale.phone && <p>شماره تماس: {sale.phone}</p>}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-3">
            {sale.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.menuItem?.name || "آیتم"}</p>
                  <p className="text-xs text-slate-500">
                    {item.qty} × {formatCurrency(item.price)} = {formatCurrency(item.price * item.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4 space-y-2">
            {sale.tax !== undefined && (
              <>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>جمع کل:</span>
                  <span>{formatCurrency(sale.total - sale.tax)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>مالیات (۹٪):</span>
                  <span>{formatCurrency(sale.tax)}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between text-xl font-bold text-slate-900">
              <span>مبلغ قابل پرداخت:</span>
              <span className="text-emerald-600">{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              onClick={handlePrint}
              className="flex-1"
            >
              چاپ رسید
            </Button>
            <a
              href={`/invoices/${sale.id}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="secondary"
                className="w-full"
              >
                مشاهده PDF
              </Button>
            </a>
            <Button
              variant="secondary"
              onClick={() => {
                router.push(`/dashboard/sales/${sale.id}`);
                onClose();
              }}
              className="flex-1"
            >
              مشاهده کامل
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              بستن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
