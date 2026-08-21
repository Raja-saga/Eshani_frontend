import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'R2 credentials not configured. Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to .env.local' },
      { status: 500 }
    );
  }

  const { audioSlug, coverSlug, coverType } = await req.json();
  const bucket = process.env.R2_BUCKET_NAME || 'eshani-media';
  const s3 = getS3();

  const [audioUploadUrl, coverUploadUrl] = await Promise.all([
    getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucket, Key: `songs/${audioSlug}.mp3`, ContentType: 'audio/mpeg' }),
      { expiresIn: 3600 }
    ),
    getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucket, Key: `covers/${coverSlug}.jpg`, ContentType: coverType || 'image/jpeg' }),
      { expiresIn: 3600 }
    ),
  ]);

  const R2_BASE = process.env.NEXT_PUBLIC_R2_URL!;
  return NextResponse.json({
    audioUploadUrl,
    coverUploadUrl,
    audioPublicUrl: `${R2_BASE}/songs/${audioSlug}.mp3`,
    coverPublicUrl: `${R2_BASE}/covers/${coverSlug}.jpg`,
  });
}
