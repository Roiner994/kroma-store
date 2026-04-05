import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: `${product.name} — KROMA`,
    description: product.description || `Compra ${product.name} en KROMA`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
