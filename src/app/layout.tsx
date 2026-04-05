import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartStoreProvider, FiltersStoreProvider } from '@/providers/StoreProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KROMA — El diseño que más te guste',
  description: 'Marca de estampados, sublimación y más. Camisas personalizadas a tu gusto, hechas para durar.',
  keywords: ['camisetas', 'ropa personalizada', 'streetwear', 'KROMA', 'oversize'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartStoreProvider>
          <FiltersStoreProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </FiltersStoreProvider>
        </CartStoreProvider>
      </body>
    </html>
  );
}
