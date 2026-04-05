'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useState } from 'react';

export default function ProductSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const [term, setTerm] = useState(searchParams.get('q')?.toString() || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('q', term);
        params.set('p', '1'); // Reset to page 1 on search
      } else {
        params.delete('q');
      }
      
      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [term, pathname, replace, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg 
          className={`h-4 w-4 ${isPending ? 'text-accent animate-pulse' : 'text-muted-foreground'}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full rounded-lg bg-surface pl-10 pr-4 py-2 text-sm outline-none ring-1 ring-border focus:ring-accent transition-all"
      />
    </div>
  );
}
