import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Node.js runtime + long timeout for large audio files
export const runtime = 'nodejs';
export const maxDuration = 120;

// Disable Next.js body parsing so we stream the raw bytes ourselves
export const dynamic = 'force-dynamic';

function getS3() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    return NextResponse.json({ error: 'R2 credentials not configured in .env.local' }, { status: 500 });
  }

  // Metadata comes from headers — avoids multipart parsing limits entirely
  const key = req.headers.get('x-file-key');
  const contentType = req.headers.get('x-content-type');

  if (!key || !contentType) {
    return NextResponse.json({ error: 'Missing x-file-key or x-content-type header' }, { status: 400 });
  }

  // Stream the raw body into a Buffer — no size cap from Next.js
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await req.arrayBuffer());
  } catch (err) {
    console.error('[upload-file] body read failed:', err);
    return NextResponse.json({ error: 'Failed to read file body' }, { status: 400 });
  }

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: 'Empty file received' }, { status: 400 });
  }

  try {
    const bucket = process.env.R2_BUCKET_NAME || 'eshani-media';
    await getS3().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
  } catch (err) {
    console.error('[upload-file] R2 upload failed:', err);
    return NextResponse.json({ error: 'R2 upload failed — check bucket credentials' }, { status: 502 });
  }

  const R2_BASE = process.env.NEXT_PUBLIC_R2_URL!;
  return NextResponse.json({ publicUrl: `${R2_BASE}/${key}` });
}
