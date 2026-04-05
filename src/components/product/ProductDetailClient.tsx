'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductWithVariations } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { FIT_TYPE_LABELS } from '@/lib/mock-data';
import { useCartStore } from '@/providers/StoreProvider';
import { buildWhatsAppProductUrl } from '@/lib/whatsapp';

interface ProductDetailClientProps {
  product: ProductWithVariations;
  relatedProducts: ProductWithVariations[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [selectedVariation, setSelectedVariation] = useState(product.variations[0]);
  const [selectedImage, setSelectedImage] = useState(product.main_image_url || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const addItem = useCartStore((s) => s.addItem);

  // Get all available sizes across all variations
  const allSizes = [...new Set(product.variations.flatMap((v) => v.skus?.map((s) => s.size_name) || []))];

  // Get available sizes for current variation
  const availableSizes = selectedVariation?.skus?.filter((s) => s.stock_count > 0).map((s) => s.size_name) || [];

  // Get current SKU
  const currentSku = selectedVariation?.skus?.find((s) => s.size_name === selectedSize);

  // Build combined gallery from main image and additional images
  const gallery = [product.main_image_url, ...(product.image_urls || [])]
    .filter((url: string | null): url is string => !!url)
    .filter((url, index, self) => self.indexOf(url) === index);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariation || !currentSku) return;
    addItem({
      productId: product.id,
      variationId: selectedVariation.id,
      skuId: currentSku.id,
      name: product.name,
      color: selectedVariation.color_name,
      colorHex: selectedVariation.color_hex,
      size: selectedSize,
      price: product.base_price,
      quantity,
      imageUrl: selectedVariation.variation_image_url || product.main_image_url || '',
      fitType: FIT_TYPE_LABELS[product.fit_type] || product.fit_type,
      slug: product.slug,
    });
  };

  const handleBuyWhatsApp = () => {
    if (!selectedSize || !selectedVariation) return;
    const url = buildWhatsAppProductUrl(
      product.name,
      selectedVariation.color_name,
      selectedSize,
      quantity,
      product.base_price,
      typeof window !== 'undefined' ? window.location.href : undefined
    );
    window.open(url, '_blank');
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-muted-foreground" id="product-breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href="/" className="hover:text-foreground transition-colors">Catálogo</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Gallery */}
        <div>
          {/* Main Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-square overflow-hidden rounded-2xl bg-surface"
          >
            <Image
              src={selectedImage || '/placeholder-product.png'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>


          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {gallery.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  className={cn(
                    'relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all',
                    selectedImage === url ? 'border-accent' : 'border-border hover:border-border-hover'
                  )}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-5">
          {/* Badge */}
          {product.badge && (
            <span className="inline-block rounded-md bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {product.badge}
            </span>
          )}

          <h1 className="text-2xl font-bold sm:text-3xl" id="product-title">{product.name}</h1>
          <p className="text-xl font-semibold">{formatPrice(product.base_price)}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Color Selector */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="font-medium uppercase tracking-wide">Color</span>
              <span className="text-muted-foreground">{selectedVariation?.color_name}</span>
            </div>
            <div className="flex gap-2">
              {product.variations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { 
                    setSelectedVariation(v); 
                    setSelectedSize(''); 
                    if (v.variation_image_url) setSelectedImage(v.variation_image_url);
                  }}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    selectedVariation?.id === v.id
                      ? 'border-accent ring-2 ring-accent/30 scale-110'
                      : 'border-border hover:border-border-hover'
                  )}
                  style={{ backgroundColor: v.color_hex }}
                  title={v.color_name}
                >
                  {selectedVariation?.id === v.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                      className={`h-full w-full p-1.5 ${v.color_hex === '#000000' || v.color_hex === '#1a237e' ? 'text-white' : 'text-black/60'}`}>
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium uppercase tracking-wide">Talla</span>
                {selectedSize && <span className="text-muted-foreground">{selectedSize}</span>}
              </div>
              <button className="text-xs text-muted-foreground underline hover:text-foreground">
                Guía de tallas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => {
                const available = availableSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => available && setSelectedSize(size)}
                    disabled={!available}
                    className={cn(
                      'flex h-10 min-w-[3rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all',
                      selectedSize === size
                        ? 'border-accent bg-accent/10 text-accent-light'
                        : available
                          ? 'border-border text-foreground hover:border-border-hover'
                          : 'border-border/50 text-muted/40 cursor-not-allowed line-through'
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                selectedSize
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-surface text-muted cursor-not-allowed'
              )}
              id="add-to-cart-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Agregar al Carrito
            </button>
          </div>

          {/* WhatsApp Buy */}
          <button
            onClick={handleBuyWhatsApp}
            disabled={!selectedSize}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all',
              selectedSize
                ? 'bg-whatsapp text-white hover:bg-whatsapp-hover'
                : 'bg-whatsapp/30 text-white/40 cursor-not-allowed'
            )}
            id="buy-whatsapp-btn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Comprar por WhatsApp
          </button>

          {/* Accordions */}
          <div className="space-y-0 border-t border-border pt-4">
            {[
              { key: 'details', title: 'Detalles del Producto', content: product.features },
              { key: 'shipping', title: 'Envíos y Devoluciones', content: ['Envío estándar: 3-5 días hábiles', 'Envío express: 1-2 días hábiles', 'Devoluciones gratuitas dentro de 30 días', 'Aplican condiciones'] },
              { key: 'care', title: 'Cuidados de Lavado', content: ['Lavar a máquina en frío', 'No usar blanqueador', 'Secar a baja temperatura', 'Planchar a baja temperatura si es necesario'] },
            ].map(({ key, title, content }) => (
              <div key={key} className="border-b border-border">
                <button
                  onClick={() => toggleAccordion(key)}
                  className="flex w-full items-center justify-between py-4 text-sm font-medium transition-colors hover:text-accent-light"
                >
                  {title}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={cn('h-4 w-4 transition-transform', openAccordion === key && 'rotate-180')}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openAccordion === key && content && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pb-4"
                  >
                    <ul className="space-y-1.5">
                      {content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" id="related-products">
          <h2 className="mb-6 text-lg font-semibold">También te podría interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((rp) => (
              <Link key={rp.id} href={`/producto/${rp.slug}`} className="group">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                  <Image
                    src={rp.main_image_url || ''}
                    alt={rp.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {rp.badge && (
                    <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {rp.badge}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-medium group-hover:text-accent-light transition-colors">{rp.name}</h3>
                    <span className="text-xs font-semibold">{formatPrice(rp.base_price)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{FIT_TYPE_LABELS[rp.fit_type]}</p>
                  <div className="mt-1 flex gap-1">
                    {rp.variations?.slice(0, 3).map((v) => (
                      <div key={v.id} className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: v.color_hex }} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
