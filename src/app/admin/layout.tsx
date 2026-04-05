'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show admin chrome on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/admin/productos', label: 'PRODUCTOS' },
  ];

  return (
    <div className="min-h-screen">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-[10px] font-bold">
                KRC
              </div>
              <span className="text-lg font-bold tracking-wide">KROMA</span>
              <span className="ml-1 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Admin
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium tracking-wide transition-colors hover:text-white',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-white border-b-2 border-accent pb-0.5'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Action buttons moved to specific pages */}
          </div>

        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
