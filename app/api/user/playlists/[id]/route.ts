import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';

async function ownsPlaylist(userId: string, id: string) {
  const row = await queryOne<{ id: string }>('SELECT id FROM user_playlists WHERE id = ? AND user_id = ?', [id, userId]);
  return !!row;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await ownsPlaylist(userId, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  await run('UPDATE user_playlists SET name = ? WHERE id = ?', [name.trim(), id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await ownsPlaylist(userId, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await run('DELETE FROM user_playlist_songs WHERE user_playlist_id = ?', [id]);
  await run('DELETE FROM user_playlists WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
