import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import type { SongRow } from '../route';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const song = await queryOne<SongRow>('SELECT * FROM songs WHERE id = ?', [id]);
    if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ song });
  } catch (err) {
    console.error('[GET /api/songs/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
}

/** Increment play count and record in play_history */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    let userId = 'guest';
    try {
      const body = await req.json();
      if (body?.userId) userId = body.userId;
    } catch { /* no body = guest */ }

    await Promise.all([
      run('UPDATE songs SET plays = plays + 1 WHERE id = ?', [id]),
      run(
        `INSERT INTO play_history (user_id, song_id, played_at) VALUES (?, ?, datetime('now'))`,
        [userId, id]
      ),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/songs/[id]]', err);
    return NextResponse.json({ error: 'Failed to record play' }, { status: 500 });
  }
}
