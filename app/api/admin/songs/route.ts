import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { run, queryOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const {
    title, artist = 'ESHANI', genre, duration, isPremium, releaseDate,
    audioUrl, imageUrl, albumId, newAlbumTitle, newAlbumDescription,
  } = await req.json();

  if (!title || !audioUrl || !imageUrl) {
    return NextResponse.json({ error: 'Missing required fields: title, audioUrl, imageUrl' }, { status: 400 });
  }

  const songId = `s-${Date.now()}`;

  // Resolve album name for the song.album column
  let albumName: string | null = null;
  if (newAlbumTitle) {
    albumName = newAlbumTitle;
  } else if (albumId && albumId !== 'standalone') {
    const row = await queryOne<{ title: string }>('SELECT title FROM albums WHERE id = ?', [albumId]);
    albumName = row?.title ?? null;
  }

  await run(
    `INSERT INTO songs (id, title, artist, album, audio_url, image_url, duration, plays, genre, is_premium, release_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [songId, title, artist, albumName, audioUrl, imageUrl,
     duration || 0, genre || null, isPremium ? 1 : 0, releaseDate || null]
  );

  // Create new album if requested
  let finalAlbumId = albumId;
  if (newAlbumTitle) {
    finalAlbumId = `al-${Date.now()}`;
    await run(
      `INSERT INTO albums (id, title, image_url, release_date, description) VALUES (?, ?, ?, ?, ?)`,
      [finalAlbumId, newAlbumTitle, imageUrl, releaseDate || null, newAlbumDescription || null]
    );
  }

  // Link song to album
  if (finalAlbumId && finalAlbumId !== 'standalone') {
    const pos = await queryOne<{ max_pos: number | null }>(
      'SELECT MAX(position) as max_pos FROM album_songs WHERE album_id = ?',
      [finalAlbumId]
    );
    await run(
      'INSERT INTO album_songs (album_id, song_id, position) VALUES (?, ?, ?)',
      [finalAlbumId, songId, (pos?.max_pos ?? 0) + 1]
    );
  }

  return NextResponse.json({ success: true, songId }, { status: 201 });
}
