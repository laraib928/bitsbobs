import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopBar variant="public" />
      <Header variant="public" />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

