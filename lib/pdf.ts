import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Utility responsible for generating lightweight invoice PDFs for CafePOS sales.
 */
export interface InvoiceDetails {
  invoiceId: string;
  cafeName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export async function generateInvoicePdf(details: InvoiceDetails) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(`${details.cafeName} Invoice`, {
    x: 50,
    y: height - 50,
    size: 18,
    font
  });

  let y = height - 90;
  details.items.forEach((item) => {
    page.drawText(`${item.quantity} x ${item.name} — $${item.price.toFixed(2)}`, {
      x: 50,
      y,
      size: 12,
      font
    });
    y -= 20;
  });

  page.drawText(`Total: $${details.total.toFixed(2)}`, {
    x: 50,
    y: y - 20,
    size: 14,
    font
  });

  const pdfBytes = await pdfDoc.save();
  const outputDir = path.join(process.cwd(), "public", "invoices");
  await fs.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${details.invoiceId}.pdf`);
  await fs.writeFile(filePath, pdfBytes);

  return filePath;
}
