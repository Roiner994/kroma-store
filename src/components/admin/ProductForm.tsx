'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ProductWithVariations } from '@/types';

interface ProductFormProps {
  initialProduct?: ProductWithVariations;
  isEditing?: boolean;
}

interface ColorVariant {
  id?: string;
  name: string;
  hex: string;
}

export default function ProductForm({ initialProduct, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productName, setProductName] = useState(initialProduct?.name || '');
  const [basePrice, setBasePrice] = useState(initialProduct?.base_price?.toString() || '0.00');
  const [fitType, setFitType] = useState(initialProduct?.fit_type || 'normal');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [mainImage, setMainImage] = useState(initialProduct?.main_image_url || '');
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialProduct?.variations?.[0]?.skus?.map(s => s.size_name) || ['S', 'M', 'L', 'XL']
  );
  
  const [colors, setColors] = useState<ColorVariant[]>(
    initialProduct?.variations?.map(v => ({ 
      id: v.id, 
      name: v.color_name, 
      hex: v.color_hex 
    })) || []
  );
  
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = () => {
    if (newColorName && newColorHex) {
      setColors((prev) => [...prev, { name: newColorName, hex: newColorHex }]);
      setNewColorName('');
      setNewColorHex('#000000');
    }
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const productPayload = {
        name: productName,
        base_price: parseFloat(basePrice),
        fit_type: fitType,
        description: description,
        main_image_url: mainImage,
        updated_at: new Date().toISOString(),
      };

      const productId = initialProduct?.id;

      if (isEditing && productId) {
        // Update product basic info
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);
        
        if (updateError) throw updateError;

        // Simple sync for variations (for this first version, we'll keep it simple)
        // Note: For a production app, we would handle variations and SKUs atomically.
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([{ 
            ...productPayload, 
            slug: productName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') 
          }])
          .select()
          .single();
        
        if (insertError) throw insertError;

        // If we have colors and sizes, create the first variation and SKUs
        if (newProduct && colors.length > 0) {
          for (const color of colors) {
            const { data: variation, error: vError } = await supabase
              .from('product_variations')
              .insert([{
                product_id: newProduct.id,
                color_name: color.name,
                color_hex: color.hex,
                display_order: 0
              }])
              .select()
              .single();

            if (vError) throw vError;

            if (variation && selectedSizes.length > 0) {
              const skuBatch = selectedSizes.map(size => ({
                variation_id: variation.id,
                size_name: size,
                stock_count: 50,
                sku_code: `KRM-${newProduct.slug.substring(0,3).toUpperCase()}-${color.name.substring(0,3).toUpperCase()}-${size}`
              }));

              const { error: skuError } = await supabase
                .from('product_skus')
                .insert(skuBatch);

              if (skuError) throw skuError;
            }
          }
        }
      }

      router.refresh();
      router.push('/admin/productos');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing ? 'Actualiza los detalles e inventario de tu producto.' : 'Define variaciones y establece detalles de inventario.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Multimedia</h2>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-surface border border-border">
            {mainImage ? (
              <Image src={mainImage} alt="Producto" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase text-muted-foreground">Sin imagen</div>
            )}
          </div>
          <input 
            type="text" 
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            placeholder="URL de la imagen"
            className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-base font-semibold">Detalles Generales</h2>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre del Producto</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Precio Base ($)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tipo</label>
              <select
                value={fitType}
                onChange={(e) => setFitType(e.target.value)}
                className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent appearance-none capitalize"
              >
                <option value="normal">Normal</option>
                <option value="oversize">Oversize</option>
                <option value="manga_larga">Manga Larga</option>
                <option value="sudadera">Sudadera / Hoodie</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent resize-none placeholder:text-muted-foreground/30 leading-relaxed"
            />
          </div>

          <div className="space-y-6 pt-4 border-t border-border/50">
            <h2 className="text-base font-semibold">Variaciones</h2>
            <div>
              <label className="mb-3 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tallas</label>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'flex h-10 w-12 items-center justify-center rounded-lg border text-sm font-medium transition-all',
                      selectedSizes.includes(size)
                        ? 'border-accent bg-accent/10 text-accent-light'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Colores</label>
              <div className="space-y-2">
                {colors.map((color, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-background/50 border border-border px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: color.hex }} />
                      <div>
                        <p className="text-sm font-medium">{color.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono">{color.hex}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeColor(i)} 
                      className="text-muted-foreground transition-colors hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border-2 border-border bg-transparent p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nombre del color"
                  className="flex-1 rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-accent"
                />
                <button 
                  type="button"
                  onClick={addColor} 
                  className="text-xs font-semibold text-accent-light transition-colors hover:text-accent uppercase tracking-wider"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
