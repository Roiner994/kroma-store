import { randomUUID } from 'crypto';
import { firebaseAdminStorage } from '@/lib/firebase/admin';
import sharp from 'sharp';

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
  const bucket = firebaseAdminStorage.bucket();

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

    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const imageId = randomUUID();
    const originalExtension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
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
    const original = bucket.file(originalPath);
    const destination = bucket.file(destinationPath);
    const thumbnail = bucket.file(thumbnailPath);

    await original.save(fileBuffer, {
      resumable: false,
      contentType: file.type || undefined,
      public: true,
    });
    await destination.save(optimizedBuffer, {
      resumable: false,
      contentType: 'image/webp',
      public: true,
    });
    await thumbnail.save(thumbnailBuffer, {
      resumable: false,
      contentType: 'image/webp',
      public: true,
    });

    imageMap.set(image.key, {
      originalUrl: `https://storage.googleapis.com/${bucket.name}/${originalPath}`,
      url: `https://storage.googleapis.com/${bucket.name}/${destinationPath}`,
      thumbUrl: `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`,
    });
  }

  return imageMap;
}
