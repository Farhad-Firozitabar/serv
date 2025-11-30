import fs from "fs/promises";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

/**
 * Utility responsible for generating lightweight invoice PDFs for سرو sales.
 */
export interface InvoiceDetails {
  invoiceId: string;
  cafeName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
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
    font
  });

  // Invoice ID
  const invoiceIdText = `شماره فاکتور: ${details.invoiceId.slice(0, 8)}`;
  const invoiceIdWidth = font.widthOfTextAtSize(invoiceIdText, 10);
  page.drawText(invoiceIdText, {
    x: width - 50 - invoiceIdWidth,
    y: height - 75,
    size: 10,
    font
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
      font
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
    font
  });

  y -= 30;

  // Items header
  const headerText = "آیتم‌ها:";
  const headerWidth = font.widthOfTextAtSize(headerText, 12);
  page.drawText(headerText, {
    x: width - 50 - headerWidth,
    y,
    size: 12,
    font
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
      font
    });
    
    page.drawText(priceText, {
      x: 50,
      y,
      size: 11,
      font
    });
    
    y -= 20;
  });

  // Total separator
  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.2, 0.2, 0.2)
  });
  y -= 20;

  // Total
  const totalText = `جمع کل: ${Math.round(details.total).toLocaleString("fa-IR")} ریال`;
  const totalWidth = font.widthOfTextAtSize(totalText, 14);
  page.drawText(totalText, {
    x: width - 50 - totalWidth,
    y,
    size: 14,
    font
  });

  // Footer
  const footerText = "با تشکر از خرید شما";
  const footerWidth = font.widthOfTextAtSize(footerText, 10);
  page.drawText(footerText, {
    x: width / 2 - footerWidth / 2,
    y: 50,
    size: 10,
    font
  });

  const pdfBytes = await pdfDoc.save();
  const outputDir = path.join(process.cwd(), "public", "invoices");
  await fs.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${details.invoiceId}.pdf`);
  await fs.writeFile(filePath, pdfBytes);

  return filePath;
}
