import { randomUUID } from 'crypto';
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

async function processWithSharp(fileBuffer: Buffer): Promise<{
  optimizedBuffer: Buffer;
  thumbnailBuffer: Buffer;
} | null> {
  try {
    const sharp = (await import('sharp')).default;
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
    return { optimizedBuffer, thumbnailBuffer };
  } catch (error) {
    console.error('sharp unavailable, uploading originals', error);
    return null;
  }
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
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processWithSharp(fileBuffer);

    const optimizedBuffer = processed?.optimizedBuffer ?? fileBuffer;
    const thumbnailBuffer = processed?.thumbnailBuffer ?? fileBuffer;
    const usedSharp = Boolean(processed);

    const destinationPath = usedSharp
      ? `product-images/${imageId}.webp`
      : `product-images/${imageId}.${originalExtension}`;
    const thumbnailPath = usedSharp
      ? `product-images/thumbs/${imageId}.webp`
      : `product-images/thumbs/${imageId}.${originalExtension}`;
    const optimizedContentType = usedSharp
      ? 'image/webp'
      : file.type || 'application/octet-stream';
    const thumbContentType = usedSharp ? 'image/webp' : file.type || 'application/octet-stream';

    const [originalUrl, url, thumbUrl] = await Promise.all([
      uploadToR2({
        key: originalPath,
        body: fileBuffer,
        contentType: file.type || 'application/octet-stream',
      }),
      uploadToR2({
        key: destinationPath,
        body: optimizedBuffer,
        contentType: optimizedContentType,
      }),
      uploadToR2({
        key: thumbnailPath,
        body: thumbnailBuffer,
        contentType: thumbContentType,
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
