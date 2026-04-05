'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ColorVariant {
  name: string;
  hex: string;
}

export default function AdminNewProductPage() {
  const [productName, setProductName] = useState('KROMA Essential Oversize');
  const [basePrice, setBasePrice] = useState('25.00');
  const [fitType, setFitType] = useState('oversize');
  const [description, setDescription] = useState('Nuestra camiseta oversize esencial. Diseñada para ofrecer la máxima comodidad con un corte relajado y tejido de algodón 100% premium. Ideal para cualquier outfit urbano o para un estilo diario sin esfuerzo.');
  const [mainImage, setMainImage] = useState('/images/products/essential-oversize-black.png');
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState<ColorVariant[]>([
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Gris Carbón', hex: '#4A4A4A' },
  ]);
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

  // Generate SKU table
  const skuRows = colors.flatMap((color) =>
    selectedSizes.map((size) => ({
      color: color.name,
      colorHex: color.hex,
      size,
      sku: `KRM-${productName.split(' ').slice(0, 2).map(w => w.slice(0, 3).toUpperCase()).join('-')}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
      stock: Math.floor(Math.random() * 120) + 10,
    }))
  );

  return (
    <div id="admin-new-product-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload photos, define variations, and set inventory details to list a new product on the catalog.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Media */}
        <div>
          <h2 className="mb-4 text-base font-semibold">Media</h2>

          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
            <Image src={mainImage} alt="Product" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <button className="absolute right-3 top-3 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

          {/* Thumbnail Slots */}
          <div className="mt-3 flex gap-2">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-accent bg-surface">
              <Image src={mainImage} alt="Thumbnail" fill className="object-cover" sizes="64px" />
            </div>
            {[1, 2, 3].map((i) => (
              <button key={i} className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted transition-colors hover:border-border-hover hover:text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          <h2 className="text-base font-semibold">General Details</h2>

          {/* Product Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent"
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Base Price ($)</label>
              <input
                type="text"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category / Type</label>
              <select
                value={fitType}
                onChange={(e) => setFitType(e.target.value)}
                className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent appearance-none"
              >
                <option value="normal">Normal</option>
                <option value="oversize">Oversized</option>
                <option value="manga_larga">Long Sleeve</option>
                <option value="sudadera">Hoodie</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-accent resize-y"
            />
          </div>

          {/* Variations */}
          <div>
            <h2 className="mb-4 text-base font-semibold">Variations</h2>

            {/* Sizes */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'flex h-10 w-12 items-center justify-center rounded-lg border text-sm font-medium transition-all',
                      selectedSizes.includes(size)
                        ? 'border-accent bg-accent/10 text-accent-light'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Colors</label>
              <div className="space-y-2">
                {colors.map((color, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                      <div>
                        <p className="text-sm font-medium">{color.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{color.hex}</p>
                      </div>
                    </div>
                    <button onClick={() => removeColor(i)} className="text-muted-foreground transition-colors hover:text-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Color */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color name"
                  className="flex-1 rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-accent"
                />
                <button onClick={addColor} className="text-sm text-accent-light transition-colors hover:text-accent">
                  + Añadir Color
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory & SKUs */}
      <div className="mt-10">
        <h2 className="mb-4 text-base font-semibold">Inventory &amp; SKUs</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Variante</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              {skuRows.slice(0, 8).map((row, i) => (
                <tr key={i} className="border-b border-border transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: row.colorHex }} />
                      <span className="text-sm">{row.color} - {row.size}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{row.sku}</td>
                  <td className="px-4 py-3 text-right text-sm">{row.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
