import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config, r2PublicUrl } from '@/lib/r2/client';

export async function uploadToR2(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const { bucket } = getR2Config();

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return r2PublicUrl(params.key);
}
