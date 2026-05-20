'use client';

import { useState, useEffect, useRef } from 'react';
import { useFiltersStore } from '@/providers/StoreProvider';
import { ProductWithVariations } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ProductWithVariations[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const categories = useFiltersStore((s) => s.categories);
  const sizes = useFiltersStore((s) => s.sizes);
  const colors = useFiltersStore((s) => s.colors);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Reset page when filters change
  const filterKey = `${categories.join(',')}-${sizes.join(',')}-${colors.join(',')}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Apply filters
  const filtered = products.filter((product) => {
    // Category filter
    if (categories.length > 0 && !categories.includes(product.fit_type)) {
      return false;
    }

    // Size filter
    if (sizes.length > 0) {
      const productSizes = product.variations?.flatMap((v) =>
        v.skus?.map((s) => s.size_name) || []
      ) || [];
      if (!sizes.some((s) => productSizes.includes(s))) {
        return false;
      }
    }

    // Color filter
    if (colors.length > 0) {
      const productColors = product.variations?.map((v) => v.color_name) || [];
      if (!colors.some((c) => productColors.includes(c))) {
        return false;
      }
    }

    return true;
  });

  const totalProducts = filtered.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalProducts);

  // Show accumulated list for infinite scroll on mobile; page-sliced for desktop
  const displayedProducts = mounted && isMobile
    ? filtered.slice(0, endIndex)
    : filtered.slice(startIndex, endIndex);

  // Setup infinite scroll observer for mobile
  useEffect(() => {
    if (!mounted || !isMobile || currentPage >= totalPages) return;

    const currentTarget = observerTargetRef.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(currentTarget);
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [mounted, isMobile, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const gridElement = document.getElementById('product-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all ${
            currentPage === i
              ? 'bg-accent text-white font-bold shadow-lg shadow-accent/20'
              : 'border border-border bg-surface/50 text-muted-foreground hover:bg-surface-hover hover:text-white font-medium'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="flex-1" id="product-grid">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mb-4 h-12 w-12 text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-muted-foreground">No se encontraron productos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {displayedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Infinite Scroll Loader for Mobile */}
          {mounted && isMobile && currentPage < totalPages && (
            <div ref={observerTargetRef} className="flex justify-center py-8">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-surface/50 border border-border px-4 py-2 rounded-full ring-1 ring-white/5 animate-pulse">
                <svg className="animate-spin h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium tracking-wide">Cargando más productos...</span>
              </div>
            </div>
          )}

          {/* Desktop Pagination Controls */}
          {totalPages > 1 && (!mounted || !isMobile) && (
            <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground text-center sm:text-left font-mono">
                Mostrando <span className="font-semibold text-foreground">{startIndex + 1}</span> a{' '}
                <span className="font-semibold text-foreground">{endIndex}</span> de{' '}
                <span className="font-semibold text-foreground">{totalProducts}</span> productos
              </p>
              <div className="flex justify-center">
                <nav className="flex items-center gap-1.5" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`h-9 w-9 rounded-lg border border-border bg-surface/50 text-muted-foreground hover:bg-surface-hover hover:text-white flex items-center justify-center transition-all ${
                      currentPage <= 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {renderPageButtons()}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`h-9 w-9 rounded-lg border border-border bg-surface/50 text-muted-foreground hover:bg-surface-hover hover:text-white flex items-center justify-center transition-all ${
                      currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
