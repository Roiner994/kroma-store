import { S3Client } from '@aws-sdk/client-s3';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function getR2Config() {
  return {
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucket: requireEnv('R2_BUCKET_NAME'),
    publicBaseUrl: requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, ''),
  };
}

let client: S3Client | undefined;

export function getR2Client(): S3Client {
  if (client) return client;

  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
}

export function r2PublicUrl(objectKey: string): string {
  const { publicBaseUrl } = getR2Config();
  return `${publicBaseUrl}/${objectKey.replace(/^\//, '')}`;
}
