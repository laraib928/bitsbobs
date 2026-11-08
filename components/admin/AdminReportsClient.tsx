'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatMoney } from '@/lib/money';
import { useToast } from './ToastContext';
import type { ChartPoint } from '@/lib/data/admin';

interface ReportData {
  period: 'day' | 'week' | 'month';
  totalRevenueFormatted: string;
  tradeRevenueFormatted: string;
  publicRevenueFormatted: string;
  topProducts: Array<{
    rank: number;
    name: string;
    code: string;
    packsSold: number;
    revenuePence: number;
  }>;
  chartPoints: ChartPoint[];
}

export function AdminReportsClient({ initialData }: { initialData: ReportData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [period, setPeriod] = useState(initialData.period);

  const handlePeriodChange = (p: 'day' | 'week' | 'month') => {
    setPeriod(p);
    router.push(`/admin/reports?period=${p}`);
  };

  // Export to CSV function
  const handleExportCsv = () => {
    const headers = ['Rank', 'Product Name', 'Product Code', 'Packs Sold', 'Revenue (GBP)'];
    const rows = initialData.topProducts.map((p) => [
      p.rank,
      `"${p.name}"`,
      p.code,
      p.packsSold,
      (p.revenuePence / 100).toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bits-n-bobs-sales-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Sales report exported to CSV successfully');
  };

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Sales & revenue reports
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Analyze wholesale turnover, guest basket metrics, and top-performing SKUs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Toggle */}
          <div className="flex bg-white border border-line rounded-xl p-1 text-[13px] font-bold shadow-xs">
            {(['day', 'week', 'month'] as const).map((p) => {
              const label = p === 'day' ? 'Daily' : p === 'week' ? 'Weekly' : 'Monthly';
              const isCurrent = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3.5 py-1.5 rounded-lg border-0 cursor-pointer capitalize transition-all ${
                    isCurrent ? 'bg-navy-deep text-white shadow-xs font-extrabold' : 'bg-transparent text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[13px] border-0 cursor-pointer shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col justify-between">
          <span className="text-[13px] font-semibold text-muted">Total Gross Turnover</span>
          <strong className="text-[28px] font-extrabold text-navy-deep my-2">
            {initialData.totalRevenueFormatted}
          </strong>
          <span className="text-[12px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md self-start">
            ↑ 14.2% vs previous period
          </span>
        </div>

        <div className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-brand-navy" />
            <span className="text-[13px] font-semibold text-muted">Trade Wholesale Revenue</span>
          </div>
          <strong className="text-[28px] font-extrabold text-brand-navy my-2">
            {initialData.tradeRevenueFormatted}
          </strong>
          <span className="text-[12px] text-muted">85.1% of total sales</span>
        </div>

        <div className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-brand-red" />
            <span className="text-[13px] font-semibold text-muted">Public Retail Revenue</span>
          </div>
          <strong className="text-[28px] font-extrabold text-brand-red my-2">
            {initialData.publicRevenueFormatted}
          </strong>
          <span className="text-[12px] text-muted">14.9% of total sales</span>
        </div>
      </div>

      {/* Recharts Breakdown Chart */}
      <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
            Sales trend ({period})
          </h2>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-brand-navy" /> Trade
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-brand-red" /> Public
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={initialData.chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} tickFormatter={(v) => `£${v}`} />
              <Tooltip />
              <Bar dataKey="trade" stackId="r" fill="#1D1650" />
              <Bar dataKey="public" stackId="r" fill="#E30512" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top Performing Products Table */}
      <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
            Best-selling products
          </h2>
          <span className="text-[13px] text-muted font-medium">Ranked by volume sold</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                <th scope="col" className="p-3.5 pl-6">Rank</th>
                <th scope="col" className="p-3.5">Product</th>
                <th scope="col" className="p-3.5">Code</th>
                <th scope="col" className="p-3.5 text-center">Packs Sold</th>
                <th scope="col" className="p-3.5 text-right pr-6">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F6]">
              {initialData.topProducts.map((p) => (
                <tr key={p.code} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3.5 pl-6 font-extrabold text-muted">
                    #{p.rank}
                  </td>
                  <td className="p-3.5 font-bold text-navy-deep">
                    {p.name}
                  </td>
                  <td className="p-3.5 text-text-2 font-mono text-[13px]">
                    {p.code}
                  </td>
                  <td className="p-3.5 text-center font-bold text-ink">
                    {p.packsSold}
                  </td>
                  <td className="p-3.5 pr-6 text-right font-extrabold text-navy-deep">
                    {formatMoney(p.revenuePence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

