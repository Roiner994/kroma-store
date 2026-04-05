'use client';

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
