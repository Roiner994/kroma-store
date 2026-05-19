import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { firebaseAdminDb } from '@/lib/firebase/admin';
import { requireAdminSession } from '@/lib/firebase/auth-server';
import { normalizeSearch, slugify, FirebaseProductDocument } from '@/lib/products';
import { resolveProductImages, type ResolvedProductImage } from '@/lib/firebase/product-images';

interface ProductMutationInput {
  name: string;
  base_price: number;
  fit_type: string;
  description: string | null;
  main_image_key: string | null;
  images: Array<{
    key: string;
    existingUrl: string | null;
    existingThumbUrl?: string | null;
    existingOriginalUrl?: string | null;
  }>;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
}

function buildUpdatedDocument(
  id: string,
  input: ProductMutationInput,
  existing: FirebaseProductDocument,
  imageMap: Map<string, ResolvedProductImage>
): FirebaseProductDocument {
  const now = new Date().toISOString();
  const slug = slugify(input.name);
  const resolvedImages = input.images
    .map((image) => imageMap.get(image.key))
    .filter((image): image is ResolvedProductImage => !!image);
  const originalImageUrls = resolvedImages.map((image) => image.originalUrl);
  const imageUrls = resolvedImages.map((image) => image.url);
  const imageThumbUrls = resolvedImages.map((image) => image.thumbUrl);
  const mainImage = input.main_image_key ? imageMap.get(input.main_image_key) ?? null : resolvedImages[0] ?? null;
  const originalMainImageUrl = mainImage?.originalUrl ?? null;
  const mainImageUrl = mainImage?.url ?? null;
  const mainImageThumbUrl = mainImage?.thumbUrl ?? null;

  const variations = input.colors.map((color, index) => {
    const existingVariation = existing.variations?.find((v) => v.color_name === color.name);
    const variationId = existingVariation?.id ?? randomUUID();
    const skus = input.sizes.map((size) => {
      const existingSku = existingVariation?.skus?.find((sku) => sku.size_name === size);
      return {
        id: existingSku?.id ?? randomUUID(),
        variation_id: variationId,
        size_name: size,
        stock_count: existingSku?.stock_count ?? 50,
        sku_code:
          existingSku?.sku_code ??
          `KRM-${input.name.substring(0, 3).toUpperCase()}-${color.name
            .substring(0, 3)
            .toUpperCase()}-${size}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        created_at: existingSku?.created_at ?? now,
      };
    });

    return {
      id: variationId,
      product_id: id,
      color_name: color.name,
      color_hex: color.hex,
      variation_image_url: mainImageUrl,
      display_order: index,
      created_at: existingVariation?.created_at ?? now,
      skus,
    };
  });

  return {
    ...existing,
    id,
    name: input.name,
    slug,
    base_price: input.base_price,
    fit_type: input.fit_type,
    description: input.description,
    original_main_image_url: originalMainImageUrl,
    main_image_url: mainImageUrl,
    main_image_thumb_url: mainImageThumbUrl,
    original_image_urls: originalImageUrls,
    image_urls: imageUrls,
    image_thumb_urls: imageThumbUrls,
    search_name: normalizeSearch(input.name),
    updated_at: now,
    variations,
  };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const formData = await request.formData();
    const rawPayload = formData.get('payload');
    if (typeof rawPayload !== 'string') {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    const input = JSON.parse(rawPayload) as ProductMutationInput;
    const ref = firebaseAdminDb.collection('products').doc(id);
    const current = await ref.get();

    if (!current.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existing = current.data() as FirebaseProductDocument;
    const imageMap = await resolveProductImages(formData, input.images);
    const updated = buildUpdatedDocument(id, input, existing, imageMap);
    await ref.set(updated);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update product', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await firebaseAdminDb.collection('products').doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete product', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
