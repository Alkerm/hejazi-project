import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/language-context';
import { CartProvider } from '@/lib/cart-context';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';

export const metadata: Metadata = {
  title: 'Half Link | هالف لينـك - كاميرات المراقبة وحلول الطاقة والبطاريات',
  description: 'High-tech surveillance security cameras, solar energy systems, and heavy-duty power station batteries for homes and desert camps in Saudi Arabia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning>
        <LanguageProvider>
          <CartProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


