export const DEFAULT_PRODUCT_IMAGE = '/images/products/essential-oversize-black.png';

/** Old Firebase Storage URLs are dead (billing closed). */
export function isUnusableProductImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    const host = new URL(url, 'http://localhost').hostname;
    if (host === 'storage.googleapis.com' || host === 'firebasestorage.googleapis.com') {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

export function resolveProductImageUrl(url: string | null | undefined): string {
  if (isUnusableProductImageUrl(url)) return DEFAULT_PRODUCT_IMAGE;
  return url as string;
}
