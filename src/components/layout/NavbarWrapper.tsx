'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Ocultamos la barra de tienda si estamos en cualquier ruta de /admin
  const isAdminPath = pathname?.startsWith('/admin');
  
  if (isAdminPath) {
    return null;
  }

  return <Navbar />;
}
