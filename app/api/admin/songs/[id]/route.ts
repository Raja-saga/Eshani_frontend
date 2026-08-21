import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body: { imageUrl?: string; audioUrl?: string } = await req.json();

  const sets: string[] = [];
  const vals: (string | number)[] = [];
  if (body.imageUrl) { sets.push('image_url = ?'); vals.push(body.imageUrl); }
  if (body.audioUrl) { sets.push('audio_url = ?'); vals.push(body.audioUrl); }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  vals.push(id);
  await run(`UPDATE songs SET ${sets.join(', ')} WHERE id = ?`, vals);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Remove from all junction tables first, then the song itself
  await run('DELETE FROM album_songs    WHERE song_id = ?', [id]);
  await run('DELETE FROM playlist_songs WHERE song_id = ?', [id]);
  await run('DELETE FROM user_likes     WHERE song_id = ?', [id]);
  await run('DELETE FROM play_history   WHERE song_id = ?', [id]);
  await run('DELETE FROM songs          WHERE id = ?',      [id]);

  return NextResponse.json({ success: true });
}
