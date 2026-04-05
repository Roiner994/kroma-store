'use client';

import { useState, useRef } from 'react';
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
  const [imageUrls, setImageUrls] = useState<string[]>(initialProduct?.image_urls || []);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleImageUpload = async (files: FileList | File[]) => {
    setUploading(true);
    setError(null);
    try {
      const newUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        newUrls.push(publicUrl);
      }

      setImageUrls(prev => [...prev, ...newUrls]);
      if (!mainImage && newUrls.length > 0) {
        setMainImage(newUrls[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir las imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    setImageUrls(prev => prev.filter(url => url !== urlToRemove));
    if (mainImage === urlToRemove) {
      const remaining = imageUrls.filter(url => url !== urlToRemove);
      setMainImage(remaining.length > 0 ? remaining[0] : '');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const addColor = () => {
    if (newColorName && newColorHex) {
      if (colors.some(c => c.name.toLowerCase() === newColorName.toLowerCase())) {
        setError('Este color ya ha sido agregado');
        return;
      }
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
        image_urls: imageUrls,
        updated_at: new Date().toISOString(),
      };

      const productId = initialProduct?.id;
      let targetProductId = productId;

      if (isEditing && productId) {
        // Update product basic info
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);
        
        if (updateError) throw updateError;
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
        targetProductId = newProduct.id;
      }

      if (targetProductId) {
        // Sync variations and SKUs
        // 1. Get current variations for this product
        const { data: existingVariations } = await supabase
          .from('product_variations')
          .select('id, color_name, color_hex')
          .eq('product_id', targetProductId);

        const currentVariationIds = existingVariations?.map(v => v.id) || [];
        const keepVariationIds: string[] = [];

        // 2. Process colors in state
        for (const color of colors) {
          let variationId: string;
          
          // Check if this color already exists in DB
          const existing = existingVariations?.find(v => v.color_name === color.name);

          if (existing) {
            variationId = existing.id;
            keepVariationIds.push(variationId);
            // Update color hex if changed
            if (color.hex !== existing.color_hex) {
              await supabase
                .from('product_variations')
                .update({ color_hex: color.hex })
                .eq('id', variationId);
            }
          } else {
            // New variation
            const { data: newV, error: vError } = await supabase
              .from('product_variations')
              .insert([{
                product_id: targetProductId,
                color_name: color.name,
                color_hex: color.hex,
                display_order: 0
              }])
              .select()
              .single();
            if (vError) throw vError;
            variationId = newV.id;
            keepVariationIds.push(variationId);
          }

          // 3. Sync SKUs for this variation (re-create for simplicity to ensure match selectedSizes)
          await supabase.from('product_skus').delete().eq('variation_id', variationId);
          
          if (selectedSizes.length > 0) {
            const skuBatch = selectedSizes.map(size => ({
              variation_id: variationId,
              size_name: size,
              stock_count: 50,
              sku_code: `KRM-${productName.substring(0,3).toUpperCase()}-${color.name.substring(0,3).toUpperCase()}-${size}-${Math.random().toString(36).substring(2,5).toUpperCase()}`
            }));

            const { error: skuError } = await supabase.from('product_skus').insert(skuBatch);
            if (skuError) throw skuError;
          }
        }

        // 4. Delete removed variations
        const toDelete = currentVariationIds.filter(id => !keepVariationIds.includes(id));
        if (toDelete.length > 0) {
          await supabase.from('product_variations').delete().in('id', toDelete);
        }
      }

      router.refresh();
      router.push('/admin/productos');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
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
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Multimedia</h2>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{imageUrls.length} Imágenes</span>
          </div>
          
          {/* Main Preview Area */}
          <div 
            className={cn(
              "relative aspect-square overflow-hidden rounded-xl bg-surface border-2 border-dashed transition-all cursor-pointer group mb-4",
              dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
              uploading && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {mainImage ? (
              <Image src={mainImage} alt="Vista previa principal" fill className="object-cover" />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-center p-6 grayscale">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-3 text-muted-foreground">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <div className="text-xs font-semibold text-foreground mb-1">Cargar imágenes</div>
                <div className="text-[10px] text-muted-foreground">Arrastra varias fotos o haz clic</div>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent-light">Subiendo...</p>
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    mainImage === url ? "border-accent shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "border-border hover:border-border/80"
                  )}
                >
                  <Image src={url} alt={`Gallery ${index}`} fill className="object-cover" />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMainImage(url); }}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider transition-colors",
                        mainImage === url ? "bg-accent text-white" : "bg-white/20 text-white hover:bg-accent"
                      )}
                    >
                      {mainImage === url ? 'Principal' : 'Usar como principal'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(url); }}
                      className="rounded bg-red-500/80 p-1 text-white hover:bg-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Principal Badge */}
                  {mainImage === url && (
                    <div className="absolute top-1 left-1 bg-accent rounded-full p-0.5 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 text-white">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add more button in grid */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 hover:border-accent/40 text-muted-foreground transition-all bg-surface/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[8px] font-bold uppercase tracking-widest">Añadir</span>
              </button>
            </div>
          )}

          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) handleImageUpload(e.target.files);
            }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="Nombre del color (ej: Negro Azabache)"
                  className="flex-1 rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-accent"
                />
                <button 
                  type="button"
                  onClick={addColor} 
                  disabled={!newColorName}
                  className="rounded-lg bg-accent/10 px-4 py-2 text-xs font-semibold text-accent-light transition-all hover:bg-accent hover:text-white disabled:opacity-30 disabled:hover:bg-accent/10 disabled:hover:text-accent-light uppercase tracking-wider"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
