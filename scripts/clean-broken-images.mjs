import { readFileSync, existsSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DEFAULT_PRODUCT_IMAGE = '/images/products/essential-oversize-black.png';

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

function isUnusable(url) {
  if (!url || typeof url !== 'string') return true;
  try {
    const host = new URL(url, 'http://localhost').hostname;
    return host === 'storage.googleapis.com' || host === 'firebasestorage.googleapis.com';
  } catch {
    return true;
  }
}

function keepUsable(urls) {
  return (urls || []).filter((url) => !isUnusable(url));
}

function pick(url, fallback = null) {
  return isUnusable(url) ? fallback : url;
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const dryRun = process.argv.includes('--dry-run');

const snapshot = await db.collection('products').get();
console.log(`Products: ${snapshot.size}${dryRun ? ' (dry-run)' : ''}`);

let updated = 0;

for (const doc of snapshot.docs) {
  const product = doc.data();
  const imageUrls = keepUsable(product.image_urls);
  const thumbUrls = keepUsable(product.image_thumb_urls);
  const originalUrls = keepUsable(product.original_image_urls);

  // Keep thumbs aligned with surviving full images when possible
  const syncedThumbs = imageUrls.map((url, index) => {
    const thumb = product.image_thumb_urls?.[index];
    return !isUnusable(thumb) ? thumb : url;
  });

  let mainUrl = pick(product.main_image_url, imageUrls[0] || null);
  let mainThumb = pick(product.main_image_thumb_url, syncedThumbs[0] || mainUrl);
  let mainOriginal = pick(product.original_main_image_url, originalUrls[0] || mainUrl);

  const hadBroken =
    (product.image_urls || []).some(isUnusable) ||
    (product.image_thumb_urls || []).some(isUnusable) ||
    (product.original_image_urls || []).some(isUnusable) ||
    isUnusable(product.main_image_url) ||
    isUnusable(product.main_image_thumb_url) ||
    isUnusable(product.original_main_image_url) ||
    (product.variations || []).some((v) => isUnusable(v.variation_image_url));

  if (!mainUrl) {
    mainUrl = DEFAULT_PRODUCT_IMAGE;
    mainThumb = DEFAULT_PRODUCT_IMAGE;
    mainOriginal = DEFAULT_PRODUCT_IMAGE;
  }

  const variations = (product.variations || []).map((v) => ({
    ...v,
    variation_image_url: pick(v.variation_image_url, mainUrl),
  }));

  if (!hadBroken && mainUrl === product.main_image_url) {
    continue;
  }

  console.log(
    `→ ${doc.id} ${product.name || ''} images ${product.image_urls?.length || 0}→${imageUrls.length}`
  );

  if (dryRun) continue;

  await doc.ref.update({
    image_urls: imageUrls.length ? imageUrls : [mainUrl],
    image_thumb_urls: imageUrls.length ? syncedThumbs : [mainThumb],
    original_image_urls: originalUrls.length ? originalUrls : [mainOriginal],
    main_image_url: mainUrl,
    main_image_thumb_url: mainThumb,
    original_main_image_url: mainOriginal,
    variations,
    updated_at: new Date().toISOString(),
  });
  updated += 1;
}

console.log(`Done. updated=${updated}`);
