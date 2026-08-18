import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { SongRow } from '../songs/route';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 1) {
      return NextResponse.json({ songs: [], query: q });
    }

    const like = `%${q}%`;

    const songs = await query<SongRow>(
      `SELECT * FROM songs
       WHERE title  LIKE ?
          OR artist LIKE ?
          OR album  LIKE ?
          OR genre  LIKE ?
       ORDER BY plays DESC
       LIMIT 20`,
      [like, like, like, like]
    );

    return NextResponse.json({ songs, query: q });
  } catch (err) {
    console.error('[GET /api/search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
