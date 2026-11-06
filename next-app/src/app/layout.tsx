import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StreamingProvider } from '@/context/StreamingContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GlobalModals from '@/components/modals/GlobalModals';

export const metadata: Metadata = {
  title: {
    default: 'KVFilmZone — Stream Movies & TV Shows',
    template: '%s | KVFilmZone',
  },
  description:
    'KVFilmZone — Netflix-inspired streaming interface for movies and TV series.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased selection:bg-brand selection:text-white flex flex-col">
        <StreamingProvider>
          <Header />
          <main className="flex-1 bg-black min-h-screen">{children}</main>
          <GlobalModals />
          <Footer />
        </StreamingProvider>
      </body>
    </html>
  );
}
