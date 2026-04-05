// ==========================================
// KROMA Store — TypeScript Type Definitions
// ==========================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  description: string | null;
  features: string[];
  fit_type: string;
  sizing_chart_url: string | null;
  main_image_url: string | null;
  image_urls: string[];
  badge: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variations?: Variation[];
}

export interface Variation {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  variation_image_url: string | null;
  display_order: number;
  created_at: string;
  skus?: Sku[];
}

export interface Sku {
  id: string;
  variation_id: string;
  size_name: string;
  stock_count: number;
  sku_code: string | null;
  created_at: string;
}

export interface CartItem {
  id: string; // unique cart item key
  productId: string;
  variationId: string;
  skuId: string;
  name: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
  fitType: string;
  slug: string;
}

export interface ProductWithVariations extends Product {
  variations: (Variation & { skus: Sku[] })[];
}

export interface FilterState {
  categories: string[];
  sizes: string[];
  colors: string[];
}
