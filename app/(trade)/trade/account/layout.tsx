import React from 'react';
import { TradeAccountSidebar } from '@/components/trade/TradeAccountSidebar';

export default function TradeAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface w-full min-h-[calc(100vh-140px)]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-6 sm:py-9 pb-20 flex flex-col md:flex-row gap-6 items-start">
        <TradeAccountSidebar />
        <div className="flex-1 min-w-0 w-full">{children}</div>
      </div>
    </div>
  );
}

