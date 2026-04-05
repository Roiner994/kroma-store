import { ProductWithVariations } from '@/types';
import { MOCK_PRODUCTS, FIT_TYPE_LABELS } from '@/lib/mock-data';

export { FIT_TYPE_LABELS };

/**
 * Get all active products (with variations and SKUs)
 * Uses mock data when Supabase is not configured.
 */
export async function getProducts(): Promise<ProductWithVariations[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
    return MOCK_PRODUCTS;
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from('products')
      .select(`*, variations (*, skus (*))`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching products:', error); return MOCK_PRODUCTS; }
    return (products as ProductWithVariations[]) || MOCK_PRODUCTS;
  } catch { return MOCK_PRODUCTS; }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithVariations | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`*, variations (*, skus (*))`)
      .eq('slug', slug)
      .single();

    if (error) { return MOCK_PRODUCTS.find((p) => p.slug === slug) || null; }
    return product as ProductWithVariations;
  } catch { return MOCK_PRODUCTS.find((p) => p.slug === slug) || null; }
}

/**
 * Get related products (excluding the current product)
 */
export async function getRelatedProducts(currentProductId: string, limit: number = 4): Promise<ProductWithVariations[]> {
  const products = await getProducts();
  return products.filter((p) => p.id !== currentProductId).slice(0, limit);
}
