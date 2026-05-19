import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_ANON_KEY;

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore();
const bucket = getStorage().bucket();

function slugify(value) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function authHeaders() {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed ${response.status}: ${text}`);
  }
  return response.json();
}

async function listPublicObjects(bucketName) {
  const url = `${supabaseUrl}/storage/v1/object/list/${bucketName}`;
  return fetchJson(url);
}

function parsePublicStorageUrl(url) {
  if (!url || !url.includes('/storage/v1/object/public/')) return null;
  const [, rest] = url.split('/storage/v1/object/public/');
  const slash = rest.indexOf('/');
  if (slash < 0) return null;
  const sourceBucket = rest.slice(0, slash);
  const objectPath = rest.slice(slash + 1);
  return { sourceBucket, objectPath };
}

async function copySupabaseObjectToFirebase(publicUrl, destinationPath) {
  const response = await fetch(publicUrl);
  if (!response.ok) throw new Error(`Failed to fetch ${publicUrl}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const file = bucket.file(destinationPath);
  await file.save(bytes, {
    resumable: false,
    contentType: response.headers.get('content-type') || undefined,
    public: true,
  });
  return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
}

async function loadRelationalProducts() {
  const [products, variations, skus] = await Promise.all([
    fetchJson(`${supabaseUrl}/rest/v1/products?select=*`),
    fetchJson(`${supabaseUrl}/rest/v1/product_variations?select=*`),
    fetchJson(`${supabaseUrl}/rest/v1/product_skus?select=*`),
  ]);

  const variationsByProduct = new Map();
  for (const variation of variations) {
    if (!variationsByProduct.has(variation.product_id)) {
      variationsByProduct.set(variation.product_id, []);
    }
    variationsByProduct.get(variation.product_id).push(variation);
  }

  const skusByVariation = new Map();
  for (const sku of skus) {
    if (!skusByVariation.has(sku.variation_id)) {
      skusByVariation.set(sku.variation_id, []);
    }
    skusByVariation.get(sku.variation_id).push(sku);
  }

  return products.map((product) => {
    const productVariations = variationsByProduct.get(product.id) || [];
    return {
      ...product,
      variations: productVariations.map((variation) => ({
        ...variation,
        skus: skusByVariation.get(variation.id) || [],
      })),
    };
  });
}

async function migrateProducts() {
  const products = await loadRelationalProducts();
  let copiedImages = 0;

  for (const product of products) {
    const imageUrls = Array.isArray(product.image_urls) ? [...product.image_urls] : [];
    const uniqueUrls = new Set(imageUrls);
    if (product.main_image_url) uniqueUrls.add(product.main_image_url);

    const urlMap = new Map();
    for (const url of uniqueUrls) {
      const parsed = parsePublicStorageUrl(url);
      if (!parsed) continue;
      const destinationPath = `product-images/${parsed.objectPath.split('/').pop()}`;
      const firebaseUrl = await copySupabaseObjectToFirebase(url, destinationPath);
      urlMap.set(url, firebaseUrl);
      copiedImages += 1;
    }

    const doc = {
      id: product.id,
      name: product.name,
      slug: product.slug || slugify(product.name),
      base_price: product.base_price,
      description: product.description ?? null,
      features: product.features ?? [],
      fit_type: product.fit_type ?? 'normal',
      sizing_chart_url: product.sizing_chart_url ?? null,
      main_image_url: product.main_image_url ? urlMap.get(product.main_image_url) || product.main_image_url : null,
      image_urls: imageUrls.map((url) => urlMap.get(url) || url),
      badge: product.badge ?? null,
      is_active: product.is_active ?? true,
      search_name: (product.name || '').toLowerCase(),
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
      variations: (product.variations || []).map((variation) => ({
        id: variation.id,
        product_id: product.id,
        color_name: variation.color_name,
        color_hex: variation.color_hex,
        variation_image_url: variation.variation_image_url ?? null,
        display_order: variation.display_order ?? 0,
        created_at: variation.created_at || new Date().toISOString(),
        skus: (variation.skus || []).map((sku) => ({
          id: sku.id,
          variation_id: variation.id,
          size_name: sku.size_name,
          stock_count: sku.stock_count ?? 0,
          sku_code: sku.sku_code ?? null,
          created_at: sku.created_at || new Date().toISOString(),
        })),
      })),
    };

    await db.collection('products').doc(product.id).set(doc, { merge: true });
  }

  return { productCount: products.length, copiedImages };
}

async function migrateCustomDesignFiles() {
  const objects = await listPublicObjects('custom-designs');
  let copied = 0;

  for (const object of objects) {
    const path = object.name;
    const sourceUrl = `${supabaseUrl}/storage/v1/object/public/custom-designs/${path}`;
    await copySupabaseObjectToFirebase(sourceUrl, `custom-designs/${path}`);
    copied += 1;
  }

  return copied;
}

async function main() {
  console.log('Starting Supabase -> Firebase migration');
  const productSummary = await migrateProducts();
  const customDesignCount = await migrateCustomDesignFiles();

  console.log('Migration complete');
  console.log(
    JSON.stringify(
      {
        products: productSummary.productCount,
        copiedProductImages: productSummary.copiedImages,
        copiedCustomDesignFiles: customDesignCount,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
