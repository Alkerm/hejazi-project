import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/store/navbar';

export const metadata: Metadata = {
  title: 'Hejazi Cosmetics Store',
  description: 'Scalable cosmetics e-commerce storefront',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
