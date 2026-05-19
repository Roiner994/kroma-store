import { ProductWithVariations } from '@/types';

interface FirebaseSku {
  id: string;
  variation_id: string;
  size_name: string;
  stock_count: number;
  sku_code: string | null;
  created_at: string;
}

interface FirebaseVariation {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  variation_image_url: string | null;
  display_order: number;
  created_at: string;
  skus: FirebaseSku[];
}

export interface FirebaseProductDocument {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  description: string | null;
  features: string[];
  fit_type: string;
  sizing_chart_url: string | null;
  original_main_image_url?: string | null;
  main_image_url: string | null;
  main_image_thumb_url?: string | null;
  original_image_urls?: string[];
  image_urls: string[];
  image_thumb_urls?: string[];
  badge: string | null;
  is_active: boolean;
  search_name: string;
  created_at: string;
  updated_at: string;
  variations: FirebaseVariation[];
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export function normalizeSearch(value: string): string {
  return value.toLowerCase().trim();
}

export function toProductWithVariations(doc: FirebaseProductDocument): ProductWithVariations {
  return {
    ...doc,
    variations: doc.variations ?? [],
  };
}
