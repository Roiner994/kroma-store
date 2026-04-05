import HeroBanner from '@/components/catalog/HeroBanner';
import WhatsAppBanner from '@/components/catalog/WhatsAppBanner';
import FiltersSidebar from '@/components/catalog/FiltersSidebar';
import ProductGrid from '@/components/catalog/ProductGrid';
import { getProducts } from '@/lib/data';

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <>
      <HeroBanner />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <FiltersSidebar />
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
