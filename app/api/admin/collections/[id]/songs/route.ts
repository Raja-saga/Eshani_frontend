import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };
function isAdmin(role: unknown) { return role === 'admin'; }

export async function POST(req: NextRequest, { params }: Params) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

  const max = await queryOne<{ pos: number | null }>(
    'SELECT MAX(position) as pos FROM collection_songs WHERE collection_id = ?', [id]
  );
  await run(
    'INSERT OR IGNORE INTO collection_songs (collection_id, song_id, position) VALUES (?, ?, ?)',
    [id, songId, (max?.pos ?? 0) + 1]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { songId } = await req.json();
  await run('DELETE FROM collection_songs WHERE collection_id = ? AND song_id = ?', [id, songId]);
  return NextResponse.json({ success: true });
}
