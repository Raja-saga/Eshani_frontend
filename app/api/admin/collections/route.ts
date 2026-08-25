import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

function adminOnly(role: unknown) {
  return role !== 'admin';
}

export async function GET() {
  const { sessionClaims } = await auth();
  if (adminOnly(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const collections = await query<{
    id: string; name: string; description: string; image_url: string; song_count: number;
  }>(`SELECT c.*, COUNT(cs.song_id) as song_count
      FROM collections c
      LEFT JOIN collection_songs cs ON cs.collection_id = c.id
      GROUP BY c.id ORDER BY c.created_at ASC`);
  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  if (adminOnly(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, description = '', imageUrl = '' } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const id = `col-${Date.now()}`;
  await run(
    'INSERT INTO collections (id, name, description, image_url) VALUES (?, ?, ?, ?)',
    [id, name.trim(), description.trim(), imageUrl.trim()]
  );
  return NextResponse.json({ collection: { id, name: name.trim(), description: description.trim(), image_url: imageUrl.trim() } }, { status: 201 });
}
