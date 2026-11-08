import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Bits 'N' Bobs | UK Supplier of Convenience Products",
    template: "%s | Bits 'N' Bobs",
  },
  description:
    'Serving your everyday needs since 1994. All the little things you always run out of. Pre-packed convenience products for homes and retailers across the UK.',
  metadataBase: new URL('https://bitsnbobs.co'),
  openGraph: {
    title: "Bits 'N' Bobs | UK Supplier of Convenience Products",
    description:
      'Serving your everyday needs since 1994. All the little things you always run out of. Pre-packed convenience products for homes and retailers across the UK.',
    url: 'https://bitsnbobs.co',
    siteName: "Bits 'N' Bobs",
    images: [
      {
        url: '/images/stand.jpg',
        width: 1217,
        height: 1292,
        alt: "Bits 'N' Bobs display stand",
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="font-sans antialiased text-ink bg-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
