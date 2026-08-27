import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

async function isAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === 'admin';
}

interface AlbumSongRow {
  id: string;
  title: string;
  artist: string;
  duration: number;
  image_url: string;
  audio_url: string;
  position: number;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;

  const songs = await query<AlbumSongRow>(
    `SELECT s.id, s.title, s.artist, s.duration, s.image_url, s.audio_url, als.position
     FROM album_songs als
     JOIN songs s ON s.id = als.song_id
     WHERE als.album_id = ?
     ORDER BY als.position ASC, s.title ASC`,
    [id]
  );
  return NextResponse.json({ songs });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

  // Get next position
  const rows = await query<{ maxPos: number }>(
    'SELECT COALESCE(MAX(position), -1) as maxPos FROM album_songs WHERE album_id = ?',
    [id]
  );
  const nextPos = (rows[0]?.maxPos ?? -1) + 1;

  await run(
    'INSERT OR IGNORE INTO album_songs (album_id, song_id, position) VALUES (?, ?, ?)',
    [id, songId, nextPos]
  );
  // Update song's album_id field too
  await run('UPDATE songs SET album_id = ? WHERE id = ?', [id, songId]);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

  await run('DELETE FROM album_songs WHERE album_id = ? AND song_id = ?', [id, songId]);
  // Clear album_id on the song
  await run(`UPDATE songs SET album_id = NULL WHERE id = ? AND album_id = ?`, [songId, id]);
  return NextResponse.json({ success: true });
}
