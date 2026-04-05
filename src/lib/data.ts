import { ProductWithVariations } from '@/types';
import { MOCK_PRODUCTS, FIT_TYPE_LABELS } from './mock-data';


export { FIT_TYPE_LABELS };

/**
 * Get products with search and pagination support
 */
export async function getProducts(options: { 
  search?: string; 
  page?: number; 
  pageSize?: number;
  isActive?: boolean;
} = {}): Promise<{ products: ProductWithVariations[]; totalCount: number }> {
  const { search, page = 1, pageSize = 10, isActive = true } = options;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase URL not found, using MOCK_PRODUCTS');
    let filtered = [...MOCK_PRODUCTS];
    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    const start = (page - 1) * pageSize;
    return {
      products: (filtered.slice(start, start + pageSize) as ProductWithVariations[]),
      totalCount: filtered.length
    };
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select(`*, variations:product_variations (*, skus:product_skus (*))`, { count: 'exact' });

    if (isActive) {
      query = query.eq('is_active', true);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: products, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) { 
      console.error('Error fetching products from Supabase:', error); 
      return { products: MOCK_PRODUCTS as ProductWithVariations[], totalCount: MOCK_PRODUCTS.length }; 
    }
    
    return {
      products: (products as ProductWithVariations[]) || [],
      totalCount: count || 0
    };
  } catch (err) { 
    console.error('Exception in getProducts:', err);
    return { products: MOCK_PRODUCTS as ProductWithVariations[], totalCount: MOCK_PRODUCTS.length }; 
  }
}


/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithVariations | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.slug === slug) || null;
  }


  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`*, variations:product_variations (*, skus:product_skus (*))`)
      .eq('slug', slug)
      .single();

    if (error) { 
      console.error(`Error fetching product by slug (${slug}):`, error);
      return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.slug === slug) || null; 
    }
    return product as ProductWithVariations;
  } catch (err) { 
    console.error(`Exception in getProductBySlug (${slug}):`, err);
    return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.slug === slug) || null; 
  }
}


/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<ProductWithVariations | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.id === id) || null;
  }


  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`*, variations:product_variations (*, skus:product_skus (*))`)
      .eq('id', id)
      .single();

    if (error) { 
      console.error(`Error fetching product by ID (${id}):`, error);
      return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.id === id) || null; 
    }
    return product as ProductWithVariations;
  } catch (err) { 
    console.error(`Exception in getProductById (${id}):`, err);
    return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.id === id) || null; 
  }
}



/**
 * Get related products (excluding the current product)
 */
export async function getRelatedProducts(currentProductId: string, limit: number = 4): Promise<ProductWithVariations[]> {

  const { products } = await getProducts();
  return products.filter((p: ProductWithVariations) => p.id !== currentProductId).slice(0, limit);
}
