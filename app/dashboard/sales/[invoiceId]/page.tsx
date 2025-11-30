import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePlan } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PrintButton from "@/components/printers/PrintButton";
import IPPPrintButton from "@/components/printers/IPPPrintButton";
import ReceiptPrint from "@/components/receipt/ReceiptPrint";
import { formatCurrency } from "@/lib/formatters";

/**
 * Invoice detail page displaying sale information and providing print/download options.
 */
export default async function InvoicePage({ params }: { params: { invoiceId: string } }) {
  await requireUser(); // Redirect admin users to admin panel
  const { authorized, session, reason } = await requirePlan(["BASIC", "PROFESSIONAL"]);
  if (!authorized || !session) {
    return <p className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">دسترسی نامعتبر: {reason}</p>;
  }

  const sale = await prisma.sale.findUnique({
    where: { id: params.invoiceId },
    include: {
      items: {
        include: {
          menuItem: true,
          product: true
        }
      }
    }
  });

  const cafeProfile = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true }
  });

  if (!sale || sale.userId !== session.userId) {
    notFound();
  }

  const invoiceUrl = `/invoices/${params.invoiceId}.pdf`;

  return (
    <section className="space-y-6 text-right">
      <header className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">فاکتور #{sale.id.slice(0, 8)}</h1>
          <p className="text-sm text-slate-500">تاریخ ثبت: {new Date(sale.createdAt).toLocaleString("fa-IR")}</p>
          {sale.phone && (
            <p className="text-sm text-slate-500">شماره تماس: {sale.phone}</p>
          )}
          <p className="text-sm text-slate-500">
            روش پرداخت: {
              sale.paymentMethod === "CASH" ? "نقدی" :
              sale.paymentMethod === "CARD_TO_CARD" ? "کارت به کارت" :
              sale.paymentMethod === "POS" ? "دستگاه پوز" :
              sale.paymentMethod
            }
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ReceiptPrint
            invoiceId={sale.id}
            items={sale.items.map((item) => ({
              name: item.menuItem?.name || item.product?.name || "آیتم",
              quantity: item.qty,
              price: Number(item.price)
            }))}
            subtotal={Number(sale.total) - Number(sale.tax)}
            tax={Number(sale.tax)}
            total={Number(sale.total)}
            phone={sale.phone}
            cafeName={cafeProfile?.name || undefined}
          />
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-brand/40 bg-white px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            مشاهده PDF
          </a>
          {session.subscriptionTier === "BASIC" && <PrintButton invoiceUrl={invoiceUrl} />}
          {session.subscriptionTier === "PROFESSIONAL" && <IPPPrintButton saleId={sale.id} invoiceUrl={invoiceUrl} />}
        </div>
      </header>

      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-50">
        <table className="min-w-full text-right">
          <thead>
            <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
              <th className="pb-2">محصول</th>
              <th className="pb-2">تعداد</th>
              <th className="pb-2">قیمت واحد</th>
              <th className="pb-2 text-left">جمع جزء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-semibold text-slate-900">
                  {item.menuItem?.name || item.product?.name || "آیتم"}
                </td>
                <td className="py-3">{item.qty}</td>
                <td className="py-3">{formatCurrency(Number(item.price))}</td>
                <td className="py-3 text-left">{formatCurrency(Number(item.price) * item.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={3} className="py-2 text-left text-sm font-semibold">
                جمع کل:
              </td>
              <td className="py-2 text-left text-sm font-semibold">{formatCurrency(Number(sale.total) - Number(sale.tax))}</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td colSpan={3} className="py-2 text-left text-sm font-semibold">
                مالیات (۹٪):
              </td>
              <td className="py-2 text-left text-sm font-semibold">{formatCurrency(Number(sale.tax))}</td>
            </tr>
            <tr className="border-t-2 border-slate-200 text-lg font-bold">
              <td colSpan={3} className="py-3 text-left">
                مبلغ قابل پرداخت:
              </td>
              <td className="py-3 text-left">{formatCurrency(Number(sale.total))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard/sales">
          <Button variant="secondary">بازگشت به لیست فروش</Button>
        </Link>
      </div>
    </section>
  );
}
