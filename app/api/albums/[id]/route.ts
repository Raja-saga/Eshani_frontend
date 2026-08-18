import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import type { SongRow } from '../../songs/route';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const album = await queryOne(`
      SELECT a.*,
             COUNT(als.song_id) AS track_count,
             SUM(s.duration)    AS total_duration
      FROM albums a
      LEFT JOIN album_songs als ON als.album_id = a.id
      LEFT JOIN songs s         ON s.id = als.song_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);

    if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const songs = await query<SongRow>(`
      SELECT s.*
      FROM songs s
      JOIN album_songs als ON als.song_id = s.id
      WHERE als.album_id = ?
      ORDER BY als.position ASC
    `, [id]);

    return NextResponse.json({ album, songs });
  } catch (err) {
    console.error('[GET /api/albums/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 });
  }
}
