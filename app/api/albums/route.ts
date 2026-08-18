import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const albums = await query(`
      SELECT a.*,
             COUNT(als.song_id) AS track_count,
             SUM(s.duration)    AS total_duration
      FROM albums a
      LEFT JOIN album_songs als ON als.album_id = a.id
      LEFT JOIN songs s         ON s.id = als.song_id
      GROUP BY a.id
      ORDER BY a.release_date DESC
    `);

    return NextResponse.json({ albums });
  } catch (err) {
    console.error('[GET /api/albums]', err);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}
