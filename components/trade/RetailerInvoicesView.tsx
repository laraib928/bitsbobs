'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RetailerOrder, RetailerAccountProfile } from '@/lib/data/trade-account';

interface RetailerInvoicesViewProps {
  orders: RetailerOrder[];
  profile: RetailerAccountProfile | null;
}

export function RetailerInvoicesView({
  orders,
  profile,
}: RetailerInvoicesViewProps) {
  // Invoices for paid or completed orders
  const paidOrders = orders.filter(
    (o) =>
      o.status.toLowerCase() !== 'cancelled' &&
      o.status.toLowerCase() !== 'pending_payment'
  );

  const [activeInvoiceOrder, setActiveInvoiceOrder] =
    useState<RetailerOrder | null>(null);

  const handleDownloadInvoice = (order: RetailerOrder) => {
    setActiveInvoiceOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-[30px] sm:text-[36px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
          VAT Invoices & Receipts
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-muted">
          Download and print official VAT tax invoices for all completed trade purchases.
        </p>
      </div>

      {paidOrders.length === 0 ? (
        <div className="bg-white border border-line rounded-[20px] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">📄</span>
          <h2 className="m-0 text-[22px] font-bold text-navy-deep">
            No invoices available yet
          </h2>
          <p className="m-0 text-[15px] text-muted max-w-md">
            Once you place and complete trade orders, formal VAT invoices with company and tax breakdown will appear here for download.
          </p>
          <Link
            href="/trade/shop"
            className="mt-3 inline-flex items-center h-11 px-6 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[14px] transition-colors"
          >
            Start shopping trade products
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-line text-left text-muted font-semibold text-[13px] uppercase tracking-wider">
                  <th scope="col" className="p-3 pl-0 whitespace-nowrap">
                    Invoice
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">
                    Date
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">
                    Order Ref
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">
                    Ex VAT
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">
                    VAT (20%)
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">
                    Total
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap text-right">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody>
                {paidOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="border-b border-[#EEEFF4] hover:bg-surface/50 transition-colors"
                  >
                    <td className="p-3 pl-0 font-bold text-navy-deep whitespace-nowrap">
                      INV-{ord.orderNumber}
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      {ord.dateFormatted}
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      <Link
                        href={`/trade/account/orders/${ord.id}`}
                        className="text-brand-navy font-semibold hover:underline"
                      >
                        {ord.orderNumberFormatted}
                      </Link>
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      {ord.subtotalFormatted}
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      {ord.vatFormatted}
                    </td>
                    <td className="p-3 font-bold text-navy-deep whitespace-nowrap">
                      {ord.totalFormatted}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[12px] font-bold px-2.5 py-1 rounded-[6px] bg-[#DCFCE7] text-[#166534]">
                        Paid
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(ord)}
                        className="inline-flex items-center gap-1.5 font-bold text-[14px] text-brand-navy hover:text-brand-red bg-transparent border-0 cursor-pointer transition-colors"
                      >
                        <span>📥</span>
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal / View (Rendered only for print or inspection) */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-white overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl print:shadow-none print:w-full print:max-w-none flex flex-col gap-6 relative">
            <div className="flex justify-between items-start print:hidden">
              <h2 className="m-0 text-[20px] font-bold text-navy-deep">
                VAT Invoice INV-{activeInvoiceOrder.orderNumber}
              </h2>
              <button
                type="button"
                onClick={() => setActiveInvoiceOrder(null)}
                className="text-muted hover:text-ink text-2xl border-0 bg-transparent cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Printable Content */}
            <div className="border border-line rounded-xl p-6 flex flex-col gap-5 text-ink text-[14px]">
              <div className="flex justify-between items-start border-b border-line pb-4">
                <div>
                  <h3 className="m-0 text-[22px] font-extrabold text-navy-deep">
                    Bits &apos;N&apos; Bobs
                  </h3>
                  <p className="mt-1 mb-0 text-text-2 text-[13px] leading-relaxed">
                    Everyday Essentials Wholesale<br />
                    Unit 4, Commerce Way, Manchester M8 8EP<br />
                    VAT Number: GB 123 4567 89
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-[18px] text-brand-red">
                    TAX INVOICE
                  </span>
                  <span className="block text-[14px] font-bold text-ink mt-1">
                    INV-{activeInvoiceOrder.orderNumber}
                  </span>
                  <span className="block text-muted text-[13px]">
                    Date: {activeInvoiceOrder.dateFormatted}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-line pb-4">
                <div>
                  <strong className="block text-[13px] uppercase tracking-wider text-muted mb-1">
                    Invoiced to:
                  </strong>
                  <p className="m-0 text-[14px] font-bold text-ink">
                    {profile?.businessName || 'Retailer Account'}
                  </p>
                  <p className="m-0 text-text-2 text-[13px]">
                    Attn: {profile?.contactName || 'Retailer'}<br />
                    {profile?.tradingAddressFormatted || 'Address on file'}
                  </p>
                  {profile?.vatNumber && (
                    <p className="mt-1 mb-0 text-[13px] text-muted">
                      Customer VAT: {profile.vatNumber}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <strong className="block text-[13px] uppercase tracking-wider text-muted mb-1">
                    Payment details:
                  </strong>
                  <p className="m-0 text-text-2 text-[13px]">
                    Status: <strong>PAID IN FULL</strong><br />
                    Order Ref: #{activeInvoiceOrder.orderNumber}<br />
                    Channel: Trade wholesale
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-line text-left text-muted font-bold">
                    <th className="py-2 pl-0">Description</th>
                    <th className="py-2 text-center">Packs</th>
                    <th className="py-2 text-right">Price/Pack</th>
                    <th className="py-2 text-right">Total (ex VAT)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoiceOrder.items.map((it) => (
                    <tr key={it.id} className="border-b border-surface">
                      <td className="py-2 pl-0 font-medium text-ink">{it.name}</td>
                      <td className="py-2 text-center text-text-2">{it.quantity}</td>
                      <td className="py-2 text-right text-text-2">{it.unitPriceFormatted}</td>
                      <td className="py-2 text-right font-semibold text-ink">{it.lineTotalFormatted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation */}
              <div className="flex justify-end pt-2">
                <div className="w-[240px] flex flex-col gap-1.5 text-[13px]">
                  <div className="flex justify-between text-text-2">
                    <span>Subtotal:</span>
                    <span>{activeInvoiceOrder.subtotalFormatted}</span>
                  </div>
                  <div className="flex justify-between text-text-2">
                    <span>Delivery:</span>
                    <span>{activeInvoiceOrder.deliveryFormatted}</span>
                  </div>
                  <div className="flex justify-between text-text-2">
                    <span>VAT (20%):</span>
                    <span>{activeInvoiceOrder.vatFormatted}</span>
                  </div>
                  <div className="pt-2 border-t border-line flex justify-between font-extrabold text-[16px] text-navy-deep">
                    <span>Total Paid:</span>
                    <span>{activeInvoiceOrder.totalFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setActiveInvoiceOrder(null)}
                className="h-11 px-5 rounded-xl border border-line bg-surface hover:bg-white text-ink font-bold text-[14px] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-11 px-6 rounded-xl bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[14px] cursor-pointer"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

