import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/admin/ToastContext';
import { getTradeShopData } from '@/lib/data/trade';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export default async function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getTradeShopData();

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-surface">
        <TopBar variant="trade" />
        <Header variant="trade" tradeProfile={profile} />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton isTrade />
      </div>
    </ToastProvider>
  );
}

