import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

async function ensureTables() {
  await run(`CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    description TEXT DEFAULT '', image_url TEXT NOT NULL DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')))`);
  await run(`CREATE TABLE IF NOT EXISTS collection_songs (
    collection_id TEXT NOT NULL, song_id TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, song_id))`);
}

export async function GET() {
  try {
    await ensureTables();
    const collections = await query<{
      id: string; name: string; description: string; image_url: string;
      song_count: number;
    }>(`SELECT c.*, COUNT(cs.song_id) as song_count
        FROM collections c
        LEFT JOIN collection_songs cs ON cs.collection_id = c.id
        GROUP BY c.id ORDER BY c.created_at ASC`);
    return NextResponse.json({ collections });
  } catch (err) {
    console.error('[GET /api/collections]', err);
    return NextResponse.json({ collections: [] });
  }
}
