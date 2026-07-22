import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/store/navbar';
import { Footer } from '@/components/store/footer';
import { LanguageProvider } from '@/lib/language-context';

export const metadata: Metadata = {
  title: 'Hejazi Cosmetics Store | متجر حجازي مستحضرات التجميل',
  description: 'Luxury hair oil, creams, lotion, and beauty cosmetics store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning>
        <LanguageProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
