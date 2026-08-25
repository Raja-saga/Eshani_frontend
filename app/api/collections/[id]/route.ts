import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import type { SongRow } from '../../songs/route';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const collection = await queryOne<{
      id: string; name: string; description: string; image_url: string;
    }>('SELECT * FROM collections WHERE id = ?', [id]);
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const songs = await query<SongRow>(`
      SELECT s.* FROM songs s
      JOIN collection_songs cs ON cs.song_id = s.id
      WHERE cs.collection_id = ?
      ORDER BY cs.position ASC`, [id]);

    return NextResponse.json({ collection, songs });
  } catch (err) {
    console.error('[GET /api/collections/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}
