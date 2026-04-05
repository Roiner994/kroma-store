'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductWithVariations } from '@/types';
import { formatPrice } from '@/lib/utils';
import { FIT_TYPE_LABELS } from '@/lib/mock-data';

interface ProductCardProps {
  product: ProductWithVariations;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const badgeColors: Record<string, string> = {
    'NUEVO': 'bg-accent',
    'MÁS VENDIDO': 'bg-accent',
    'AGOTADO': 'bg-muted/80',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        href={`/producto/${product.slug}`}
        className="group block"
        id={`product-card-${product.slug}`}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
          {product.main_image_url && (
            <Image
              src={product.main_image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}

          {/* Badge */}
          {product.badge && (
            <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${badgeColors[product.badge] || 'bg-accent'}`}>
              {product.badge}
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight group-hover:text-accent-light transition-colors">
              {product.name}
            </h3>
            <span className="shrink-0 text-sm font-semibold">
              {formatPrice(product.base_price)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {FIT_TYPE_LABELS[product.fit_type] || product.fit_type}
            {product.features && product.features[1] && ` • ${product.features[1]}`}
          </p>

          {/* Color swatches */}
          {product.variations && product.variations.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.variations.map((v) => (
                <div
                  key={v.id}
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: v.color_hex }}
                  title={v.color_name}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
