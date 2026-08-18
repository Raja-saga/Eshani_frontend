import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface SongRow {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  audio_url: string;
  image_url: string;
  duration: number;
  plays: number;
  genre: string | null;
  is_premium: number;
  release_date: string | null;
  youtube_id: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const genre    = searchParams.get('genre');
    const limit    = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const featured = searchParams.get('featured') === 'true';

    let sql = 'SELECT * FROM songs';
    const params: (string | number)[] = [];

    if (genre) {
      sql += ' WHERE genre = ?';
      params.push(genre);
    }

    sql += featured
      ? ' ORDER BY plays DESC'
      : ' ORDER BY release_date DESC, plays DESC';

    sql += ` LIMIT ?`;
    params.push(limit);

    const songs = await query<SongRow>(sql, params);
    return NextResponse.json({ songs });
  } catch (err) {
    console.error('[GET /api/songs]', err);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
