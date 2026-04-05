import Link from 'next/link';
import { getProducts } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div id="admin-products-page">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Variants</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border transition-colors hover:bg-surface-hover">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-surface">
                      {product.main_image_url && (
                        <Image src={product.main_image_url} alt={product.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{product.fit_type}</td>
                <td className="px-4 py-3 text-sm">{formatPrice(product.base_price)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{product.variations?.length || 0} colors</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.badge === 'AGOTADO' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {product.badge === 'AGOTADO' ? 'Out of stock' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
