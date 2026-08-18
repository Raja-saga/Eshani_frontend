import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import type { SongRow } from '../../songs/route';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const playlist = await queryOne(`
      SELECT p.*, COUNT(ps.song_id) AS track_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const songs = await query<SongRow>(`
      SELECT s.*
      FROM songs s
      JOIN playlist_songs ps ON ps.song_id = s.id
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC
    `, [id]);

    return NextResponse.json({ playlist, songs });
  } catch (err) {
    console.error('[GET /api/playlists/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}
