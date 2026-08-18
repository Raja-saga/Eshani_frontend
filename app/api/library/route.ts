import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import type { SongRow } from '../songs/route';

/** GET /api/library — returns liked songs + recent play history for the current user */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [likedSongs, recentHistory] = await Promise.all([
      query<SongRow>(`
        SELECT s.*
        FROM songs s
        JOIN user_likes ul ON ul.song_id = s.id
        WHERE ul.user_id = ?
        ORDER BY ul.created_at DESC
      `, [userId]),

      query<SongRow & { played_at: string }>(`
        SELECT s.*, ph.played_at
        FROM songs s
        JOIN play_history ph ON ph.song_id = s.id
        WHERE ph.user_id = ?
        ORDER BY ph.played_at DESC
        LIMIT 30
      `, [userId]),
    ]);

    // Deduplicate recently played (keep most recent occurrence per song)
    const seen = new Set<string>();
    const recentlyPlayed = recentHistory.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

    return NextResponse.json({ likedSongs, recentlyPlayed });
  } catch (err) {
    console.error('[GET /api/library]', err);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}
