'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Ocultamos la barra de tienda si estamos en cualquier ruta de /admin
  const isAdminPath = pathname?.startsWith('/admin');
  
  if (isAdminPath) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
