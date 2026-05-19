import { ProductWithVariations } from '@/types';
import { MOCK_PRODUCTS, FIT_TYPE_LABELS } from './mock-data';
import { firebaseAdminDb } from '@/lib/firebase/admin';
import { FirebaseProductDocument, toProductWithVariations } from '@/lib/products';

export { FIT_TYPE_LABELS };

function shouldUseMockData(): boolean {
  return process.env.USE_MOCK_DATA === 'true';
}

function ensureFirebaseConfigured() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error('Firebase is not configured');
  }
}

async function listProductsFromFirestore(): Promise<ProductWithVariations[]> {
  const snapshot = await firebaseAdminDb.collection('products').get();

  return snapshot.docs
    .map((doc) => toProductWithVariations(doc.data() as FirebaseProductDocument))
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
}

function getMockProducts(options: {
  search?: string;
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}): { products: ProductWithVariations[]; totalCount: number } {
  const { search, page = 1, pageSize = 10, isActive = true } = options;
  let filtered = [...MOCK_PRODUCTS];

  if (isActive) {
    filtered = filtered.filter((product) => product.is_active);
  }

  if (search) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  const start = (page - 1) * pageSize;

  return {
    products: filtered.slice(start, start + pageSize) as ProductWithVariations[],
    totalCount: filtered.length,
  };
}

export async function getProducts(options: {
  search?: string;
  page?: number;
  pageSize?: number;
  isActive?: boolean;
} = {}): Promise<{ products: ProductWithVariations[]; totalCount: number }> {
  const { search, page = 1, pageSize = 10, isActive = true } = options;

  if (shouldUseMockData()) {
    return getMockProducts(options);
  }

  try {
    ensureFirebaseConfigured();
    let products = await listProductsFromFirestore();

    if (isActive) {
      products = products.filter((p) => p.is_active);
    }

    if (search) {
      const needle = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(needle));
    }

    const start = (page - 1) * pageSize;
    return {
      products: products.slice(start, start + pageSize),
      totalCount: products.length,
    };
  } catch (error) {
    console.error('Error fetching products from Firestore', error);
    throw new Error('Failed to fetch products from Firestore');
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariations | null> {
  if (shouldUseMockData()) {
    return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.slug === slug) || null;
  }

  try {
    ensureFirebaseConfigured();
    const snapshot = await firebaseAdminDb.collection('products').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    return toProductWithVariations(snapshot.docs[0].data() as FirebaseProductDocument);
  } catch (error) {
    console.error('Error fetching product by slug', error);
    throw new Error(`Failed to fetch product by slug: ${slug}`);
  }
}

export async function getProductById(id: string): Promise<ProductWithVariations | null> {
  if (shouldUseMockData()) {
    return (MOCK_PRODUCTS as ProductWithVariations[]).find((p) => p.id === id) || null;
  }

  try {
    ensureFirebaseConfigured();
    const doc = await firebaseAdminDb.collection('products').doc(id).get();
    if (!doc.exists) return null;
    return toProductWithVariations(doc.data() as FirebaseProductDocument);
  } catch (error) {
    console.error('Error fetching product by id', error);
    throw new Error(`Failed to fetch product by id: ${id}`);
  }
}

export async function getRelatedProducts(
  currentProductId: string,
  limit = 4
): Promise<ProductWithVariations[]> {
  const { products } = await getProducts();
  return products.filter((p) => p.id !== currentProductId).slice(0, limit);
}
