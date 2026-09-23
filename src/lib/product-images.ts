import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { uploadToR2 } from '@/lib/r2/upload';

interface ProductImageInput {
  key: string;
  existingUrl: string | null;
  existingThumbUrl?: string | null;
  existingOriginalUrl?: string | null;
}

export interface ResolvedProductImage {
  originalUrl: string;
  url: string;
  thumbUrl: string;
}

export async function resolveProductImages(
  formData: FormData,
  images: ProductImageInput[]
): Promise<Map<string, ResolvedProductImage>> {
  const imageMap = new Map<string, ResolvedProductImage>();

  for (const image of images) {
    if (image.existingUrl) {
      imageMap.set(image.key, {
        originalUrl: image.existingOriginalUrl ?? image.existingUrl,
        url: image.existingUrl,
        thumbUrl: image.existingThumbUrl ?? image.existingUrl,
      });
      continue;
    }

    const file = formData.get(`image:${image.key}`);
    if (!(file instanceof File)) {
      throw new Error(`Missing upload for image key: ${image.key}`);
    }

    const originalExtension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const imageId = randomUUID();
    const originalPath = `product-images/originals/${imageId}.${originalExtension}`;
    const destinationPath = `product-images/${imageId}.webp`;
    const thumbnailPath = `product-images/thumbs/${imageId}.webp`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const optimizedBuffer = await sharp(fileBuffer)
      .rotate()
      .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toBuffer();

    const thumbnailBuffer = await sharp(fileBuffer)
      .rotate()
      .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();

    const [originalUrl, url, thumbUrl] = await Promise.all([
      uploadToR2({
        key: originalPath,
        body: fileBuffer,
        contentType: file.type || 'application/octet-stream',
      }),
      uploadToR2({
        key: destinationPath,
        body: optimizedBuffer,
        contentType: 'image/webp',
      }),
      uploadToR2({
        key: thumbnailPath,
        body: thumbnailBuffer,
        contentType: 'image/webp',
      }),
    ]);

    imageMap.set(image.key, {
      originalUrl,
      url,
      thumbUrl,
    });
  }

  return imageMap;
}
