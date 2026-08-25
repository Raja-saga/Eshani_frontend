import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ playlists: [] });

  await ensureTables().catch(() => {});
  const playlists = await query<{
    id: string; name: string; description: string; created_at: string;
  }>('SELECT id, name, description, created_at FROM user_playlists WHERE user_id = ? ORDER BY created_at DESC', [userId]);

  const songRows = await query<{ user_playlist_id: string; song_id: string; position: number }>(
    `SELECT ups.user_playlist_id, ups.song_id, ups.position
     FROM user_playlist_songs ups
     INNER JOIN user_playlists up ON up.id = ups.user_playlist_id
     WHERE up.user_id = ?
     ORDER BY ups.position ASC`,
    [userId]
  );

  const songMap = new Map<string, string[]>();
  for (const row of songRows) {
    const arr = songMap.get(row.user_playlist_id) ?? [];
    arr.push(row.song_id);
    songMap.set(row.user_playlist_id, arr);
  }

  return NextResponse.json({
    playlists: playlists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      songIds: songMap.get(p.id) ?? [],
      createdAt: p.created_at,
    })),
  });
}

async function ensureTables() {
  await run(`CREATE TABLE IF NOT EXISTS user_playlists (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
    name TEXT NOT NULL, description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')))`);
  await run(`CREATE TABLE IF NOT EXISTS user_playlist_songs (
    user_playlist_id TEXT NOT NULL, song_id TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0, added_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_playlist_id, song_id))`);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureTables();
  const { name, description = '' } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const id = `up-${userId.slice(-6)}-${Date.now()}`;
  const createdAt = new Date().toISOString();
  await run(
    'INSERT INTO user_playlists (id, user_id, name, description, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, userId, name.trim(), description.trim(), createdAt]
  );

  return NextResponse.json({ playlist: { id, name: name.trim(), description: description.trim(), songIds: [], createdAt } }, { status: 201 });
}
