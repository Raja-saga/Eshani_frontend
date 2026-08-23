import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { run, queryOne } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body: {
    title?: string;
    artist?: string;
    genre?: string | null;
    duration?: number;
    isPremium?: boolean;
    releaseDate?: string | null;
    imageUrl?: string;
    audioUrl?: string;
    albumId?: string;
  } = await req.json();

  const sets: string[] = [];
  const vals: (string | number | null)[] = [];

  if (body.title !== undefined)       { sets.push('title = ?');        vals.push(body.title); }
  if (body.artist !== undefined)      { sets.push('artist = ?');       vals.push(body.artist); }
  if (body.genre !== undefined)       { sets.push('genre = ?');        vals.push(body.genre || null); }
  if (body.duration !== undefined)    { sets.push('duration = ?');     vals.push(body.duration); }
  if (body.isPremium !== undefined)   { sets.push('is_premium = ?');   vals.push(body.isPremium ? 1 : 0); }
  if (body.releaseDate !== undefined) { sets.push('release_date = ?'); vals.push(body.releaseDate || null); }
  if (body.imageUrl)                  { sets.push('image_url = ?');    vals.push(body.imageUrl); }
  if (body.audioUrl)                  { sets.push('audio_url = ?');    vals.push(body.audioUrl); }

  // Resolve album name from albumId and update denormalized column
  if (body.albumId !== undefined) {
    if (body.albumId && body.albumId !== 'standalone') {
      const album = await queryOne<{ title: string }>('SELECT title FROM albums WHERE id = ?', [body.albumId]);
      sets.push('album = ?');
      vals.push(album?.title ?? null);
    } else {
      sets.push('album = ?');
      vals.push(null);
    }
  }

  if (sets.length === 0 && body.albumId === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  if (sets.length > 0) {
    vals.push(id);
    await run(`UPDATE songs SET ${sets.join(', ')} WHERE id = ?`, vals);
  }

  // Update album_songs junction table
  if (body.albumId !== undefined) {
    await run('DELETE FROM album_songs WHERE song_id = ?', [id]);
    if (body.albumId && body.albumId !== 'standalone') {
      const pos = await queryOne<{ max_pos: number | null }>(
        'SELECT MAX(position) as max_pos FROM album_songs WHERE album_id = ?',
        [body.albumId]
      );
      await run(
        'INSERT INTO album_songs (album_id, song_id, position) VALUES (?, ?, ?)',
        [body.albumId, id, (pos?.max_pos ?? 0) + 1]
      );
    }
  }

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

  await run('DELETE FROM album_songs    WHERE song_id = ?', [id]);
  await run('DELETE FROM playlist_songs WHERE song_id = ?', [id]);
  await run('DELETE FROM user_likes     WHERE song_id = ?', [id]);
  await run('DELETE FROM play_history   WHERE song_id = ?', [id]);
  await run('DELETE FROM songs          WHERE id = ?',      [id]);

  return NextResponse.json({ success: true });
}
