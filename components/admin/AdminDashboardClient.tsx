'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useToast } from './ToastContext';
import { restockProductAction, updateTradeAccountStatusAction } from '@/lib/actions/admin';
import type {
  AdminDashboardData,
  LowStockItem,
  PendingTradeAccount,
  ChartPoint,
} from '@/lib/data/admin';

interface AdminDashboardClientProps {
  initialData: AdminDashboardData;
}

// Number Count-Up Component (800ms)
function CountUpNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const duration = 800;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * value;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

// KPI Card Sparkline using Recharts AreaChart
interface KpiSparklineProps {
  data: number[];
  isUp: boolean;
  id: string;
}

function KpiSparkline({ data, isUp, id }: KpiSparklineProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const strokeColor = isUp ? '#1E7A3E' : '#E30512';
  const gradientId = `kpi-sparkline-grad-${id}`;

  // Always 7 data points (one per day), filling missing days with 0
  const rawList = Array.isArray(data) ? data : [];
  const pointsCount = 7;
  const normalizedData = rawList.slice(-pointsCount);
  while (normalizedData.length < pointsCount) {
    normalizedData.unshift(0);
  }

  const chartData = normalizedData.map((val, idx) => ({
    val: typeof val === 'number' && !isNaN(val) ? val : 0,
    day: idx,
  }));

  // Y domain ['dataMin', 'dataMax'] with a little padding so the line is never cut off at the top or bottom
  const values = chartData.map((d) => d.val);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const padding = range === 0 ? (minVal === 0 ? 1 : Math.abs(minVal) * 0.1) : range * 0.14;
  const yDomain: [number, number] = [minVal - padding, maxVal + padding];

  if (!mounted) {
    return <div className="w-[96px] h-[36px] flex-none" />;
  }

  return (
    <div className="w-[96px] h-[36px] flex items-center justify-end overflow-hidden flex-none">
      <AreaChart
        width={96}
        height={36}
        data={chartData}
        margin={{ top: 3, right: 2, bottom: 3, left: 2 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={yDomain} />
        <Area
          type="monotone"
          dataKey="val"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={!shouldReduceMotion}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </AreaChart>
    </div>
  );
}

// Custom Recharts Tooltip
function ChartCustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload as ChartPoint;
  return (
    <div className="bg-[#1D1650] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs flex flex-col gap-1.5 min-w-[150px]">
      <strong className="block text-[#FFEC00] font-bold border-b border-white/10 pb-1">
        {dataPoint.fullDate || label}
      </strong>
      <div className="flex justify-between items-center text-soft-on-dark">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-brand-navy" />
          Trade
        </span>
        <strong className="text-white">£{dataPoint.trade.toLocaleString('en-GB')}</strong>
      </div>
      <div className="flex justify-between items-center text-soft-on-dark">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-brand-red" />
          Public
        </span>
        <strong className="text-white">£{dataPoint.public.toLocaleString('en-GB')}</strong>
      </div>
      <div className="border-t border-white/10 pt-1 mt-0.5 flex justify-between items-center font-extrabold text-[13px]">
        <span>Total</span>
        <span className="text-[#FFEC00]">£{dataPoint.total.toLocaleString('en-GB')}</span>
      </div>
    </div>
  );
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();

  // Greeting based on current time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
      ? 'Good afternoon'
      : 'Good evening';

  // Segmented range state
  const [selectedRange, setSelectedRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [chartType, setChartType] = useState<'bars' | 'line'>('bars');

  // Interactive Lists
  const [lowStock, setLowStock] = useState<LowStockItem[]>(initialData.lowStockItems);
  const [pendingAccounts, setPendingAccounts] = useState<PendingTradeAccount[]>(initialData.pendingAccounts);

  // Restock Modal State
  const [restockItem, setRestockItem] = useState<LowStockItem | null>(null);
  const [packsToAdd, setPacksToAdd] = useState(12);
  const [isRestocking, setIsRestocking] = useState(false);

  // Approving Trade Account State
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Sync state if initialData changes
  useEffect(() => {
    setLowStock(initialData.lowStockItems);
    setPendingAccounts(initialData.pendingAccounts);
  }, [initialData]);

  // Handle Range Selection change
  const handleRangeChange = (range: 'today' | '7days' | '30days' | 'custom') => {
    setSelectedRange(range);
    startTransition(() => {
      router.push(`/admin?range=${range}`);
    });
  };

  // Handle Restock Submit
  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || packsToAdd <= 0) return;

    setIsRestocking(true);
    const result = await restockProductAction(restockItem.productId, packsToAdd);
    setIsRestocking(false);

    if (result.success) {
      showToast('success', `Added ${packsToAdd} packs to ${restockItem.name}`);
      // Optimistic state update
      setLowStock((prev) =>
        prev.map((item) => {
          if (item.productId === restockItem.productId) {
            const newCount = (result.newPacks ?? (item.packsLeft + packsToAdd));
            const newPercentage = Math.min(100, Math.round((newCount / Math.max(1, item.lowStockAt)) * 100));
            return {
              ...item,
              packsLeft: newCount,
              percentage: newPercentage,
              status: newCount === 0 ? 'critical' : newCount <= item.lowStockAt ? 'low' : 'ok',
            };
          }
          return item;
        })
      );
      setRestockItem(null);
    } else {
      showToast('error', result.error || 'Failed to update stock');
    }
  };

  // Handle Inline Trade Account Approval
  const handleApproveAccount = async (account: PendingTradeAccount) => {
    setApprovingId(account.id);
    const result = await updateTradeAccountStatusAction(account.id, 'approved');
    setApprovingId(null);

    if (result.success) {
      showToast('success', `Approved trade account for ${account.businessName}`);
      setPendingAccounts((prev) => prev.filter((a) => a.id !== account.id));
    } else {
      showToast('error', result.error || 'Failed to approve account');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* 1. Header with greeting and segmented control */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[36px] font-extrabold font-stretch-110 text-navy-deep leading-tight">
            {greeting}, {initialData.adminFirstName}
          </h1>
          <p className="mt-1 mb-0 text-[15px] font-medium text-muted">
            {initialData.currentDateFormatted}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Control */}
          <div
            role="tablist"
            aria-label="Time period range"
            className="flex items-center bg-white border border-line rounded-xl p-1 shadow-xs"
          >
            {(['today', '7days', '30days'] as const).map((r) => {
              const label = r === 'today' ? 'Today' : r === '7days' ? '7 days' : '30 days';
              const isSelected = selectedRange === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleRangeChange(r)}
                  className={`relative px-3.5 py-1.5 rounded-[9px] text-[13px] font-bold border-0 cursor-pointer transition-colors ${
                    isSelected ? 'text-navy-deep font-extrabold' : 'text-muted hover:text-ink bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="segmented-range-indicator"
                      className="absolute inset-0 bg-surface rounded-[9px] shadow-xs z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white no-underline font-bold text-[14px] shadow-xs transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards Row (Staggered Animation + CountUp + Sparklines) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {/* Sales */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-line rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-muted">
              {initialData.kpis.sales.label}
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              £
            </span>
          </div>
          <div className="my-2">
            <span className="text-[26px] font-extrabold text-navy-deep tracking-tight">
              £<CountUpNumber value={initialData.kpis.sales.rawValue / 100} decimals={2} />
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] pt-1 min-h-[36px]">
            <span
              className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                initialData.kpis.sales.trendDirection !== 'down'
                  ? 'text-[#1E7A3E] bg-[#E8F5E9]'
                  : 'text-[#E30512] bg-[#FDE6E8]'
              }`}
            >
              {initialData.kpis.sales.trendDirection !== 'down' ? '↑' : '↓'}{' '}
              {Math.abs(initialData.kpis.sales.trendPct)}%
            </span>
            <KpiSparkline
              data={initialData.kpis.sales.sparkline}
              isUp={initialData.kpis.sales.trendDirection !== 'down'}
              id="sales"
            />
          </div>
        </motion.div>

        {/* Orders Placed */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-line rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-muted">Orders placed</span>
            <span className="w-8 h-8 rounded-full bg-indigo-50 text-brand-navy flex items-center justify-center font-bold text-sm">
              🛍
            </span>
          </div>
          <div className="my-2">
            <span className="text-[26px] font-extrabold text-navy-deep tracking-tight">
              <CountUpNumber value={initialData.kpis.orders.rawValue} />
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] pt-1 min-h-[36px]">
            <span
              className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                initialData.kpis.orders.trendDirection !== 'down'
                  ? 'text-[#1E7A3E] bg-[#E8F5E9]'
                  : 'text-[#E30512] bg-[#FDE6E8]'
              }`}
            >
              {initialData.kpis.orders.trendDirection !== 'down' ? '↑' : '↓'}{' '}
              {Math.abs(initialData.kpis.orders.trendPct)}%
            </span>
            <KpiSparkline
              data={initialData.kpis.orders.sparkline}
              isUp={initialData.kpis.orders.trendDirection !== 'down'}
              id="orders"
            />
          </div>
        </motion.div>

        {/* Packs Sold */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-line rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-muted">Packs sold</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
              📦
            </span>
          </div>
          <div className="my-2">
            <span className="text-[26px] font-extrabold text-navy-deep tracking-tight">
              <CountUpNumber value={initialData.kpis.packs.rawValue} />
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] pt-1 min-h-[36px]">
            <span
              className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                initialData.kpis.packs.trendDirection !== 'down'
                  ? 'text-[#1E7A3E] bg-[#E8F5E9]'
                  : 'text-[#E30512] bg-[#FDE6E8]'
              }`}
            >
              {initialData.kpis.packs.trendDirection !== 'down' ? '↑' : '↓'}{' '}
              {Math.abs(initialData.kpis.packs.trendPct)}%
            </span>
            <KpiSparkline
              data={initialData.kpis.packs.sparkline}
              isUp={initialData.kpis.packs.trendDirection !== 'down'}
              id="packs"
            />
          </div>
        </motion.div>

        {/* Trade Applications */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-line rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-muted">Waiting approval</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              🏪
            </span>
          </div>
          <div className="my-2">
            <span className="text-[26px] font-extrabold text-navy-deep tracking-tight">
              <CountUpNumber value={pendingAccounts.length} />
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] pt-1 min-h-[36px]">
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                pendingAccounts.length > 0 ? 'bg-amber-50 text-amber-800' : 'bg-surface text-muted'
              }`}
            >
              {pendingAccounts.length} pending
            </span>
            <Link
              href="/admin/trade-accounts?status=pending"
              className="font-bold text-brand-navy hover:text-brand-red no-underline transition-colors flex items-center gap-0.5"
            >
              Review now →
            </Link>
          </div>
        </motion.div>

        {/* Low Stock Lines */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-line rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-muted">Low stock lines</span>
            <span className="w-8 h-8 rounded-full bg-red-50 text-brand-red flex items-center justify-center font-bold text-sm">
              ⚠️
            </span>
          </div>
          <div className="my-2">
            <span className="text-[26px] font-extrabold text-brand-red tracking-tight">
              <CountUpNumber value={lowStock.filter((i) => i.status !== 'ok').length} />
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] pt-1 min-h-[36px]">
            <span className="font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
              Needs order
            </span>
            <Link
              href="/admin/products?filter=low-stock"
              className="font-bold text-brand-navy hover:text-brand-red no-underline transition-colors flex items-center gap-0.5"
            >
              View list →
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Two-Column Grid: Interactive Recharts Sales Chart & Running Low */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Chart with Recharts */}
        <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
                Sales overview
              </h2>
              <span className="text-[13px] text-muted font-medium">
                Period total:{' '}
                <strong className="text-navy-deep font-bold">{initialData.chartTotalFormatted}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="flex items-center gap-2.5 text-[12px] text-muted font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1D1650]" /> Trade
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#E30512]" /> Public
                </span>
              </div>

              {/* Chart Type Toggle */}
              <div className="flex bg-surface rounded-lg p-0.5 text-[12px]">
                <button
                  type="button"
                  onClick={() => setChartType('bars')}
                  className={`px-2.5 py-1 rounded-[6px] border-0 cursor-pointer font-bold ${
                    chartType === 'bars' ? 'bg-white text-navy-deep shadow-xs' : 'bg-transparent text-muted'
                  }`}
                >
                  Bars
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 rounded-[6px] border-0 cursor-pointer font-bold ${
                    chartType === 'line' ? 'bg-white text-navy-deep shadow-xs' : 'bg-transparent text-muted'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bars' ? (
                <BarChart data={initialData.chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717A', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717A', fontSize: 12 }}
                    tickFormatter={(val) => `£${val}`}
                  />
                  <Tooltip content={<ChartCustomTooltip />} />
                  <Bar
                    dataKey="trade"
                    stackId="sales"
                    fill="#1D1650"
                    radius={[0, 0, 0, 0]}
                    isAnimationActive={!shouldReduceMotion}
                  />
                  <Bar
                    dataKey="public"
                    stackId="sales"
                    fill="#E30512"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={!shouldReduceMotion}
                  />
                </BarChart>
              ) : (
                <LineChart data={initialData.chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717A', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717A', fontSize: 12 }}
                    tickFormatter={(val) => `£${val}`}
                  />
                  <Tooltip content={<ChartCustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="trade"
                    stroke="#1D1650"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#1D1650' }}
                    isAnimationActive={!shouldReduceMotion}
                  />
                  <Line
                    type="monotone"
                    dataKey="public"
                    stroke="#E30512"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#E30512' }}
                    isAnimationActive={!shouldReduceMotion}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Running Low with Visual Progress Bars & Inline Restock Modal Trigger */}
        <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
                Running low on stock
              </h2>
              <Link
                href="/admin/products"
                className="text-[13px] font-bold text-brand-navy hover:text-brand-red no-underline"
              >
                All stock →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line text-left text-muted font-semibold text-[13px]">
                    <th scope="col" className="pb-2.5 pl-0">Product</th>
                    <th scope="col" className="pb-2.5 text-center">Remaining</th>
                    <th scope="col" className="pb-2.5 text-center">Threshold</th>
                    <th scope="col" className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F6]">
                  {lowStock.map((prod) => (
                    <tr key={prod.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-2.5 pl-0">
                        <div className="flex items-center gap-3">
                          <Image
                            src={prod.image}
                            alt=""
                            width={34}
                            height={34}
                            className="w-8 h-8 object-contain rounded-md border border-line bg-white p-0.5 flex-none"
                          />
                          <div className="min-w-0">
                            <strong className="block text-ink font-semibold truncate leading-tight">
                              {prod.name}
                            </strong>
                            <span className="text-[11px] text-muted">Code #{prod.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-black text-[14px] ${
                              prod.packsLeft === 0
                                ? 'text-brand-red'
                                : prod.packsLeft <= prod.lowStockAt
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {prod.packsLeft} packs
                          </span>
                          {/* Mini Progress Bar */}
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              style={{ width: `${prod.percentage}%` }}
                              className={`h-full rounded-full ${
                                prod.packsLeft === 0
                                  ? 'bg-brand-red'
                                  : prod.packsLeft <= prod.lowStockAt
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-text-2 text-[13px]">
                        {prod.lowStockAt}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setRestockItem(prod);
                            setPacksToAdd(12);
                          }}
                          className="px-3 py-1 rounded-lg bg-surface hover:bg-brand-navy hover:text-white text-navy-deep font-bold text-[12px] border border-line cursor-pointer transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Latest Orders (Consistent Badges, Relative Time, Clickable Row) */}
      <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <div>
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Latest orders
            </h2>
            <p className="m-0 text-[13px] text-muted">Recent orders requiring fulfillment</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-[13px] font-bold text-brand-navy hover:text-brand-red no-underline"
          >
            View all orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line text-left text-muted font-semibold text-[13px]">
                <th scope="col" className="pb-3 pl-0">Order</th>
                <th scope="col" className="pb-3">Customer</th>
                <th scope="col" className="pb-3">Channel</th>
                <th scope="col" className="pb-3">Contents</th>
                <th scope="col" className="pb-3">Total</th>
                <th scope="col" className="pb-3">Status</th>
                <th scope="col" className="pb-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F6]">
              {initialData.latestOrders.map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => router.push(`/admin/orders/${ord.orderNumber}`)}
                  className="hover:bg-surface/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 pl-0 font-extrabold text-navy-deep group-hover:text-brand-red">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3 font-semibold text-ink">
                    {ord.customerName}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {ord.channel === 'trade' ? (
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E6F7] text-[#312682]">
                        Trade
                      </span>
                    ) : (
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FDE6E8] text-[#9E0010]">
                        Public
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-text-2 text-[13px]">
                    {ord.itemsCountDescription}
                  </td>
                  <td className="py-3 font-black text-navy-deep">
                    {ord.totalFormatted}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span
                      style={{ backgroundColor: ord.statusBg, color: ord.statusFg }}
                      className="text-[12px] font-bold px-2.5 py-1 rounded-md capitalize"
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-muted text-[13px] whitespace-nowrap">
                    {ord.relativeTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Two-Column Grid: Trade Accounts Waiting For Approval & Stand Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Approvals with Inline Animated Confirmation */}
        <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Trade accounts waiting for approval
            </h2>
            <Link
              href="/admin/trade-accounts"
              className="text-[13px] font-bold text-brand-navy hover:text-brand-red no-underline"
            >
              All accounts →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {pendingAccounts.length === 0 ? (
                <div className="py-8 text-center text-muted text-[14px]">
                  ✓ All trade account applications have been reviewed!
                </div>
              ) : (
                pendingAccounts.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 rounded-xl border border-line hover:border-brand-navy/30 transition-colors flex flex-wrap items-center justify-between gap-3 bg-surface/30"
                  >
                    <div className="min-w-0 flex-1">
                      <strong className="block text-ink font-bold text-[15px] truncate">
                        {app.businessName}
                      </strong>
                      <span className="text-[12px] text-muted">
                        {app.businessType} · {app.postcode} · {app.contactName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/trade-accounts?search=${encodeURIComponent(app.businessName)}`}
                        className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-surface text-ink text-[12px] font-semibold no-underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        disabled={approvingId === app.id}
                        onClick={() => handleApproveAccount(app)}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[12px] border-0 cursor-pointer transition-colors disabled:opacity-60"
                      >
                        {approvingId === app.id ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Stand Requests & Rep Visits */}
        <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Stand requests & rep visits
            </h2>
            <span className="text-[12px] text-muted font-bold">
              {initialData.standRequests.length} active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {initialData.standRequests.length === 0 ? (
              <div className="py-8 text-center text-muted text-[14px]">
                ✓ No active display stand requests
              </div>
            ) : (
              initialData.standRequests.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl border border-line bg-surface/30 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="block text-ink font-bold text-[15px] truncate">
                      {st.shopName}
                    </strong>
                    <span className="text-[12px] text-muted">{st.meta}</span>
                    {st.message && (
                      <p className="mt-1 mb-0 text-[12px] text-text-2 italic">
                        &quot;{st.message}&quot;
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                    {st.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Restock Product Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 border border-line animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="m-0 text-[20px] font-extrabold text-navy-deep">
                  Restock {restockItem.name}
                </h3>
                <p className="mt-1 mb-0 text-[13px] text-muted">
                  Current stock: <strong>{restockItem.packsLeft} packs</strong> (Threshold: {restockItem.lowStockAt})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="p-1 rounded-lg text-muted hover:text-ink border-0 bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Packs to add into warehouse
                <div className="grid grid-cols-4 gap-2 pt-1 pb-2">
                  {[6, 12, 24, 48].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setPacksToAdd(qty)}
                      className={`h-10 rounded-xl font-bold text-[14px] border cursor-pointer transition-colors ${
                        packsToAdd === qty
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-surface text-ink border-line hover:border-brand-navy'
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={packsToAdd}
                  onChange={(e) => setPacksToAdd(Math.max(1, parseInt(e.target.value) || 0))}
                  className="h-12 border border-field-border rounded-xl px-3.5 font-sans text-[16px] text-ink outline-none focus:border-brand-navy"
                />
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="flex-1 h-12 rounded-xl bg-surface hover:bg-line text-ink font-bold text-[14px] border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="flex-1 h-12 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[14px] border-0 cursor-pointer transition-colors shadow-xs disabled:opacity-60"
                >
                  {isRestocking ? 'Updating...' : `Add ${packsToAdd} packs`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

