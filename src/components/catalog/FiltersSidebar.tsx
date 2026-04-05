'use client';

import { useFiltersStore } from '@/providers/StoreProvider';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'normal', label: 'Corte Normal' },
  { id: 'oversize', label: 'Corte Oversize' },
  { id: 'manga_larga', label: 'Manga Larga' },
  { id: 'sudadera', label: 'Sudaderas' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Negro', hex: '#000000' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Rojo', hex: '#c62828' },
  { name: 'Azul', hex: '#1a237e' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Beige', hex: '#d4a574' },
];

export default function FiltersSidebar() {
  const categories = useFiltersStore((s) => s.categories);
  const sizes = useFiltersStore((s) => s.sizes);
  const colors = useFiltersStore((s) => s.colors);
  const toggleCategory = useFiltersStore((s) => s.toggleCategory);
  const toggleSize = useFiltersStore((s) => s.toggleSize);
  const toggleColor = useFiltersStore((s) => s.toggleColor);
  const clearAll = useFiltersStore((s) => s.clearAll);
  const hasActiveFilters = useFiltersStore((s) => s.hasActiveFilters);

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-48" id="filters-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtros</h2>
        {hasActiveFilters() && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground underline transition-colors hover:text-foreground"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Categoría</h3>
          <span className="text-muted">—</span>
        </div>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                  categories.includes(cat.id)
                    ? 'border-accent bg-accent'
                    : 'border-border'
                )}
                onClick={() => toggleCategory(cat.id)}
              >
                {categories.includes(cat.id) && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-white">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span onClick={() => toggleCategory(cat.id)}>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Talla</h3>
          <span className="text-muted">—</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                'flex h-9 w-12 items-center justify-center rounded-md border text-xs font-medium transition-all',
                sizes.includes(size)
                  ? 'border-accent bg-accent/10 text-accent-light'
                  : 'border-border text-muted-foreground hover:border-border-hover hover:text-foreground'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Color</h3>
          <span className="text-muted">—</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              title={color.name}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-all',
                colors.includes(color.name)
                  ? 'border-accent ring-2 ring-accent/30 scale-110'
                  : 'border-border hover:border-border-hover'
              )}
              style={{ backgroundColor: color.hex }}
            >
              {colors.includes(color.name) && color.hex !== '#000000' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full p-1 text-black/60">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
              {colors.includes(color.name) && color.hex === '#000000' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full p-1 text-white">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
