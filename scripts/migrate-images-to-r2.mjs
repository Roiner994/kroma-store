import { readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = value.replace(/\\n/g, '\n');
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.vercel');

const required = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_BASE_URL',
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();
const gcsBucket = getStorage().bucket();
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const r2PublicBase = process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '');

function parseGcsUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes(r2PublicBase)) return null; // already on R2

  const gcsPrefix = 'https://storage.googleapis.com/';
  if (url.startsWith(gcsPrefix)) {
    const rest = url.slice(gcsPrefix.length);
    const slash = rest.indexOf('/');
    if (slash < 0) return null;
    return { bucket: rest.slice(0, slash), path: decodeURIComponent(rest.slice(slash + 1)) };
  }

  // firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?...
  const fbMatch = url.match(
    /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/
  );
  if (fbMatch) {
    return { bucket: fbMatch[1], path: decodeURIComponent(fbMatch[2]) };
  }

  return null;
}

async function downloadFromGcs(path) {
  const [buf] = await gcsBucket.file(path).download();
  return buf;
}

async function uploadR2(key, body, contentType) {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return `${r2PublicBase}/${key}`;
}

async function migrateBuffer(fileBuffer, sourceHint) {
  const imageId = randomUUID();
  const ext =
    sourceHint && sourceHint.includes('.')
      ? sourceHint.split('.').pop().split('?')[0]
      : 'bin';

  const originalPath = `product-images/originals/${imageId}.${ext || 'bin'}`;
  const destinationPath = `product-images/${imageId}.webp`;
  const thumbnailPath = `product-images/thumbs/${imageId}.webp`;

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

  const contentType =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream';

  const [originalUrl, url, thumbUrl] = await Promise.all([
    uploadR2(originalPath, fileBuffer, contentType),
    uploadR2(destinationPath, optimizedBuffer, 'image/webp'),
    uploadR2(thumbnailPath, thumbnailBuffer, 'image/webp'),
  ]);

  return { originalUrl, url, thumbUrl };
}

async function resolveUrl(url) {
  if (!url) return null;
  if (url.includes(r2PublicBase)) {
    return { originalUrl: url, url, thumbUrl: url, skipped: true };
  }

  const parsed = parseGcsUrl(url);
  if (!parsed) {
    // try download via HTTP as last resort
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return migrateBuffer(buf, url);
  }

  const buf = await downloadFromGcs(parsed.path);
  return migrateBuffer(buf, parsed.path);
}

function collectUrls(product) {
  const urls = new Set();
  for (const key of [
    'main_image_url',
    'main_image_thumb_url',
    'original_main_image_url',
  ]) {
    if (product[key]) urls.add(product[key]);
  }
  for (const listKey of ['image_urls', 'image_thumb_urls', 'original_image_urls']) {
    for (const u of product[listKey] || []) {
      if (u) urls.add(u);
    }
  }
  for (const v of product.variations || []) {
    if (v.variation_image_url) urls.add(v.variation_image_url);
  }
  return [...urls];
}

function remap(url, map) {
  if (!url) return url;
  return map.get(url)?.url ?? url;
}

function remapThumb(url, map) {
  if (!url) return url;
  return map.get(url)?.thumbUrl ?? map.get(url)?.url ?? url;
}

function remapOriginal(url, map) {
  if (!url) return url;
  return map.get(url)?.originalUrl ?? map.get(url)?.url ?? url;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const snapshot = await db.collection('products').get();
  console.log(`Products: ${snapshot.size}${dryRun ? ' (dry-run)' : ''}`);

  let updated = 0;
  let failed = 0;

  for (const doc of snapshot.docs) {
    const product = doc.data();
    const urls = collectUrls(product);
    if (urls.length === 0) {
      console.log(`- ${doc.id} ${product.name || ''} (no images)`);
      continue;
    }

    const alreadyR2 = urls.every((u) => u.includes(r2PublicBase));
    if (alreadyR2) {
      console.log(`- ${doc.id} already on R2`);
      continue;
    }

    console.log(`→ ${doc.id} ${product.name || ''} (${urls.length} urls)`);
    const map = new Map();

    try {
      for (const url of urls) {
        if (map.has(url)) continue;
        const resolved = await resolveUrl(url);
        map.set(url, resolved);
        if (!resolved.skipped) {
          console.log(`  migrated ${url.slice(0, 80)}...`);
        }
      }

      if (dryRun) continue;

      const patch = {
        main_image_url: remap(product.main_image_url, map),
        main_image_thumb_url: remapThumb(
          product.main_image_thumb_url || product.main_image_url,
          map
        ),
        original_main_image_url: remapOriginal(
          product.original_main_image_url || product.main_image_url,
          map
        ),
        image_urls: (product.image_urls || []).map((u) => remap(u, map)),
        image_thumb_urls: (product.image_thumb_urls || product.image_urls || []).map((u) =>
          remapThumb(u, map)
        ),
        original_image_urls: (product.original_image_urls || product.image_urls || []).map((u) =>
          remapOriginal(u, map)
        ),
        variations: (product.variations || []).map((v) => ({
          ...v,
          variation_image_url: remap(v.variation_image_url, map),
        })),
        updated_at: new Date().toISOString(),
      };

      await doc.ref.update(patch);
      updated += 1;
      console.log(`  ✓ updated`);
    } catch (error) {
      failed += 1;
      console.error(`  ✗ ${doc.id}:`, error.message || error);
    }
  }

  console.log(`Done. updated=${updated} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
