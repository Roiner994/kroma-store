import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { uploadToR2 } from '@/lib/r2/upload';

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 400 });
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const key = `custom-designs/${randomUUID()}.${extension}`;
    const body = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2({
      key,
      body,
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Custom design upload failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
