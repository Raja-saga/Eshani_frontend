import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';

async function ownsPlaylist(userId: string, id: string) {
  const row = await queryOne<{ id: string }>('SELECT id FROM user_playlists WHERE id = ? AND user_id = ?', [id, userId]);
  return !!row;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await ownsPlaylist(userId, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

  const existing = await queryOne<{ song_id: string }>(
    'SELECT song_id FROM user_playlist_songs WHERE user_playlist_id = ? AND song_id = ?',
    [id, songId]
  );
  if (existing) return NextResponse.json({ ok: true });

  const pos = await queryOne<{ max_pos: number | null }>(
    'SELECT MAX(position) as max_pos FROM user_playlist_songs WHERE user_playlist_id = ?',
    [id]
  );
  await run(
    'INSERT INTO user_playlist_songs (user_playlist_id, song_id, position, added_at) VALUES (?, ?, ?, ?)',
    [id, songId, (pos?.max_pos ?? 0) + 1, new Date().toISOString()]
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await ownsPlaylist(userId, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

  await run('DELETE FROM user_playlist_songs WHERE user_playlist_id = ? AND song_id = ?', [id, songId]);
  return NextResponse.json({ ok: true });
}
