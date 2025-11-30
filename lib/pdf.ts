import fs from "fs/promises";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

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

/**
 * Utility responsible for generating lightweight invoice PDFs for سرو sales.
 */
export interface InvoiceDetails {
  invoiceId: string;
  cafeName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal?: number;
  tax?: number;
  total: number;
  phone?: string;
}

export async function generateInvoicePdf(details: InvoiceDetails) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontPath = path.join(process.cwd(), "public", "fonts", "Vazirmatn-Regular.ttf");
  const fontBytes = await fs.readFile(fontPath);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });

  // Header
  const title = `فاکتور ${details.cafeName}`;
  const titleWidth = font.widthOfTextAtSize(title, 20);
  page.drawText(title, {
    x: width - 50 - titleWidth,
    y: height - 50,
    size: 20,
    font,
    color: rgb(0, 0, 0)
  });

  // Invoice ID
  const invoiceIdText = `شماره فاکتور: ${details.invoiceId.slice(0, 8)}`;
  const invoiceIdWidth = font.widthOfTextAtSize(invoiceIdText, 10);
  page.drawText(invoiceIdText, {
    x: width - 50 - invoiceIdWidth,
    y: height - 75,
    size: 10,
    font,
    color: rgb(0, 0, 0)
  });

  // Phone number if provided
  let y = height - 100;
  if (details.phone) {
    const phoneText = `شماره تماس: ${details.phone}`;
    const phoneWidth = font.widthOfTextAtSize(phoneText, 10);
    page.drawText(phoneText, {
      x: width - 50 - phoneWidth,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    });
    y -= 20;
  }

  // Date
  const now = new Date();
  const dateText = `تاریخ: ${now.toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" })}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 10);
  page.drawText(dateText, {
    x: width - 50 - dateWidth,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0)
  });

  y -= 30;

  // Items header
  const headerText = "آیتم‌ها:";
  const headerWidth = font.widthOfTextAtSize(headerText, 12);
  page.drawText(headerText, {
    x: width - 50 - headerWidth,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  });
  y -= 25;

  // Items
  details.items.forEach((item) => {
    const itemTotal = item.quantity * item.price;
    const line = `${item.quantity} × ${item.name}`;
    const priceText = `${Math.round(itemTotal).toLocaleString("fa-IR")} ریال`;
    const lineWidth = font.widthOfTextAtSize(line, 11);
    const priceWidth = font.widthOfTextAtSize(priceText, 11);
    
    page.drawText(line, {
      x: width - 50 - lineWidth,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(priceText, {
      x: 50,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    
    y -= 20;
  });

  // Total separator
  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0, 0, 0)
  });
  y -= 20;

  // Subtotal (if provided)
  if (details.subtotal !== undefined) {
    const subtotalText = `جمع کل: ${Math.round(details.subtotal).toLocaleString("fa-IR")} ریال`;
    const subtotalWidth = font.widthOfTextAtSize(subtotalText, 11);
    page.drawText(subtotalText, {
      x: width - 50 - subtotalWidth,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    y -= 20;
  }

  // Tax (if provided)
  if (details.tax !== undefined) {
    const taxText = `مالیات (۹٪): ${Math.round(details.tax).toLocaleString("fa-IR")} ریال`;
    const taxWidth = font.widthOfTextAtSize(taxText, 11);
    page.drawText(taxText, {
      x: width - 50 - taxWidth,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    y -= 20;
  }

  // Total
  const totalText = `مبلغ قابل پرداخت: ${Math.round(details.total).toLocaleString("fa-IR")} ریال`;
  const totalWidth = font.widthOfTextAtSize(totalText, 14);
  page.drawText(totalText, {
    x: width - 50 - totalWidth,
    y,
    size: 14,
    font,
    color: rgb(0, 0, 0)
  });

  // Footer
  const thankYouText = "با تشکر از خرید شما";
  const thankYouWidth = font.widthOfTextAtSize(thankYouText, 10);
  page.drawText(thankYouText, {
    x: width / 2 - thankYouWidth / 2,
    y: 50,
    size: 10,
    font,
    color: rgb(0, 0, 0)
  });

  // Random beautiful message
  const randomMessage = beautifulMessages[Math.floor(Math.random() * beautifulMessages.length)];
  const messageWidth = font.widthOfTextAtSize(randomMessage, 9);
  page.drawText(randomMessage, {
    x: width / 2 - messageWidth / 2,
    y: 30,
    size: 9,
    font,
    color: rgb(0, 0, 0)
  });

  const pdfBytes = await pdfDoc.save();
  const outputDir = path.join(process.cwd(), "public", "invoices");
  await fs.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${details.invoiceId}.pdf`);
  await fs.writeFile(filePath, pdfBytes);

  return filePath;
}
