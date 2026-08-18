import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface PlaylistRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  curator: string | null;
  mood: string | null;
  is_official: number;
  track_count: number;
}

export async function GET() {
  try {
    const playlists = await query<PlaylistRow>(`
      SELECT p.*,
             COUNT(ps.song_id) AS track_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      WHERE p.is_official = 1
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `);

    return NextResponse.json({ playlists });
  } catch (err) {
    console.error('[GET /api/playlists]', err);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}
