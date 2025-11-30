"use client";

import { useRef, useMemo } from "react";
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

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptPrintProps {
  invoiceId: string;
  items: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  phone?: string | null;
  cafeName?: string;
}

/**
 * Receipt component designed for printing with good visual design.
 */
export default function ReceiptPrint({
  invoiceId,
  items,
  subtotal,
  tax,
  total,
  phone,
  cafeName = "سرو"
}: ReceiptPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const randomMessage = useMemo(() => {
    return beautifulMessages[Math.floor(Math.random() * beautifulMessages.length)];
  }, []);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="fa">
            <head>
              <meta charset="UTF-8">
              <title>فاکتور ${invoiceId.slice(0, 8)}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
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
                .header p {
                  font-size: 12px;
                  color: #000000;
                  font-weight: bold;
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
                  body {
                    padding: 0;
                  }
                  .receipt {
                    border: none;
                    box-shadow: none;
                    max-width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
      >
        چاپ رسید
      </button>
      <div ref={printRef} className="hidden">
        <div className="receipt">
          <div className="header">
            <h1>{cafeName}</h1>
            <p>فاکتور فروش</p>
          </div>
          <div className="info">
            <div className="info-row">
              <span>شماره فاکتور:</span>
              <span>{invoiceId.slice(0, 8)}</span>
            </div>
            {phone && (
              <div className="info-row">
                <span>شماره تماس:</span>
                <span>{phone}</span>
              </div>
            )}
            <div className="info-row">
              <span>تاریخ:</span>
              <span>{new Date().toLocaleDateString("fa-IR")}</span>
            </div>
            <div className="info-row">
              <span>زمان:</span>
              <span>{new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          <div className="items">
            {items.map((item, index) => (
              <div key={index} className="item">
                <span className="item-name">{item.name}</span>
                <div className="item-details">
                  <div>{item.quantity} × {formatCurrency(item.price)}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {subtotal !== undefined && (
            <div style={{ borderTop: "1px solid #000000", paddingTop: "8px", marginTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold" }}>
              <span>جمع کل:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          )}
          {tax !== undefined && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginTop: "4px" }}>
              <span>مالیات (۹٪):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="total">
            <span>مبلغ قابل پرداخت:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="footer">
            <p style={{ marginBottom: 8 }}>با تشکر از خرید شما</p>
            <p style={{ marginBottom: 8, fontSize: 11 }}>{randomMessage}</p>
            <p style={{ marginTop: 8, fontSize: 10 }}>سرو - سیستم مدیریت کافه</p>
          </div>
        </div>
      </div>
    </>
  );
}
