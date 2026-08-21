import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [songs, albums, playlists, plays, topSongs, genres, recentPlays] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM songs'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM albums'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM playlists WHERE is_official = 1'),
    queryOne<{ total: number }>('SELECT SUM(plays) as total FROM songs'),
    query<{ id: string; title: string; artist: string; image_url: string; plays: number }>(
      'SELECT id, title, artist, image_url, plays FROM songs ORDER BY plays DESC LIMIT 8'
    ),
    query<{ genre: string; count: number }>(
      "SELECT genre, COUNT(*) as count FROM songs WHERE genre IS NOT NULL GROUP BY genre ORDER BY count DESC"
    ),
    query<{ song_id: string; played_at: string; user_id: string | null }>(
      'SELECT song_id, played_at, user_id FROM play_history ORDER BY played_at DESC LIMIT 20'
    ),
  ]);

  // Clerk user count
  let userCount = 0;
  try {
    const r = await fetch('https://api.clerk.com/v1/users/count', {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (r.ok) {
      const d = await r.json();
      userCount = d.total_count ?? 0;
    }
  } catch { /* ignore */ }

  // Anonymous vs signed-in plays from play_history
  const anonPlays = recentPlays.filter(p => !p.user_id).length;
  const authPlays = recentPlays.filter(p => p.user_id).length;

  return NextResponse.json({
    songs:       songs?.count ?? 0,
    albums:      albums?.count ?? 0,
    playlists:   playlists?.count ?? 0,
    totalPlays:  plays?.total ?? 0,
    users:       userCount,
    topSongs,
    genres,
    anonPlays,
    authPlays,
  });
}
