import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mandados Admin',
  description: 'Admin dashboard for Mandados delivery service',
  appleWebApp: {
    capable: true,
    title: 'Mandados Admin',
    statusBarStyle: 'default',
  },
  // Standards-based counterpart to appleWebApp.capable; silences Chrome's
  // "apple-mobile-web-app-capable is deprecated" warning. No first-class
  // Metadata field exists for it, so it's set via `other`.
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#4EBD93',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
