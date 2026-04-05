/**
 * Format a number as a price string (e.g. "$25.00")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Generate a SKU code from product name, color, and size
 * e.g., "KROMA Essential Oversize" + "Negro" + "M" → "KRM-ESS-BLK-M"
 */
export function generateSkuCode(productName: string, colorName: string, size: string): string {
  const colorMap: Record<string, string> = {
    negro: 'BLK',
    blanco: 'WHT',
    gris: 'GRY',
    'gris carbón': 'GRC',
    azul: 'BLU',
    'azul marino': 'NVY',
    rojo: 'RED',
    verde: 'GRN',
    amarillo: 'YLW',
    rosa: 'PNK',
    beige: 'BGE',
  };

  const words = productName.toUpperCase().split(/\s+/).slice(0, 3);
  const prefix = words.map(w => w.slice(0, 3)).join('-');
  const colorCode = colorMap[colorName.toLowerCase()] || colorName.slice(0, 3).toUpperCase();

  return `${prefix}-${colorCode}-${size.toUpperCase()}`;
}

/**
 * Classname merge utility
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
