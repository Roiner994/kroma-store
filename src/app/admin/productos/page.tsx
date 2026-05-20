import Link from 'next/link';
import { getProducts } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import ProductSearch from '@/components/admin/ProductSearch';
import Pagination from '@/components/admin/Pagination';
import ProductActions from '@/components/admin/ProductActions';
import { resolvePage } from '@/lib/data';

export default async function AdminProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string | string[]; p?: string | string[] }> 
}) {
  const { q: search, p: pageStr } = await searchParams;
  const searchTerm = Array.isArray(search) ? search[0] : search;
  const requestedPage = Number(Array.isArray(pageStr) ? pageStr[0] : pageStr);
  const pageSize = 10;

  const { products, totalCount } = await getProducts({ 
    search: searchTerm, 
    page: requestedPage, 
    pageSize 
  });
  const page = resolvePage(requestedPage, totalCount, pageSize);

  return (
    <div id="admin-products-page" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tu catálogo, stock y variaciones.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover w-fit"
        >
          + Agregar Producto
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <ProductSearch />
        <div className="text-xs text-muted-foreground bg-surface/50 border border-border px-3 py-1 rounded-full">
          {totalCount} productos en total
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface/30">
        {products.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Variantes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-surface/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-white/5">
                            {product.main_image_url && (
                              <Image
                                  src={product.main_image_thumb_url || product.main_image_url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                              />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium leading-none truncate">{product.name}</span>
                            <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter truncate opacity-60">
                              {product.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                        <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium border border-white/5">
                          {product.fit_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-mono whitespace-nowrap">{formatPrice(product.base_price)}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-slow" />
                          {product.variations?.length || 0} colores
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${product.badge === 'AGOTADO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                          {product.badge === 'AGOTADO' ? 'Agotado' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <ProductActions productId={product.id} productName={product.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-border">
              {products.map((product) => (
                <div key={product.id} className="p-4 space-y-3 hover:bg-surface/10 transition-colors">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-white/5">
                      {product.main_image_url && (
                        <Image
                          src={product.main_image_thumb_url || product.main_image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-sm font-semibold truncate text-foreground">{product.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tighter truncate opacity-60">
                        {product.slug}
                      </span>
                      <span className="text-sm font-mono mt-1 font-semibold text-accent-light">
                        {formatPrice(product.base_price)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-60">Categoría</span>
                      <span className="capitalize text-foreground font-medium truncate">
                        {product.fit_type}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-60">Variantes</span>
                      <span className="text-foreground font-medium">
                        {product.variations?.length || 0} colores
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-60">Estado</span>
                      <div>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${product.badge === 'AGOTADO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                          {product.badge === 'AGOTADO' ? 'Agotado' : 'Activo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-border/30">
                    <ProductActions productId={product.id} productName={product.name} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="px-4 py-20 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-surface p-4 ring-1 ring-border shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">No se encontraron productos</p>
                <p className="text-xs text-muted-foreground">Prueba ajustando tu búsqueda o borrando los filtros actuales.</p>
              </div>
            </div>
          </div>
        )}
        
        <Pagination 
          currentPage={page} 
          totalCount={totalCount} 
          pageSize={pageSize} 
          currentQuery={searchTerm}
        />
      </div>
    </div>
  );
}
