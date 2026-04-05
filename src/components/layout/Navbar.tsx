'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCartStore } from '@/providers/StoreProvider';

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  const navLinks = [
    { href: '/', label: 'CATÁLOGO' },
    { href: '/personalizados', label: 'PERSONALIZADOS' },
    { href: '/nosotros', label: 'NOSOTROS' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-effect">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-[10px] font-bold tracking-tighter">
            KRC
          </div>
          <span className="text-lg font-bold tracking-wide group-hover:text-accent-light transition-colors">
            KROMA
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`nav-${link.label.toLowerCase()}`}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-white ${
                pathname === link.href
                  ? 'text-white border-b-2 border-accent pb-0.5'
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-white"
            id="nav-search"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-white"
            id="nav-cart"
            aria-label="Carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border px-4 py-3"
          >
            <div className="mx-auto max-w-2xl">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full rounded-lg bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none ring-1 ring-border focus:ring-accent"
                autoFocus
                id="search-input"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
