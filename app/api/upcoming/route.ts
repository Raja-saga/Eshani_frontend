import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface UpcomingRow {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  release_date: string | null;
  genre: string | null;
  pre_orders: number;
  created_at: string;
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS upcoming_releases (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      artist       TEXT NOT NULL DEFAULT 'ESHANI',
      image_url    TEXT NOT NULL DEFAULT '',
      release_date TEXT,
      genre        TEXT DEFAULT '',
      pre_orders   INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    )
  `);
}

// Public endpoint — no auth required, used by homepage + discover page
export async function GET() {
  try {
    await ensureTable();
    const rows = await query<UpcomingRow>(
      `SELECT id, title, artist, image_url, release_date, genre, pre_orders, created_at
       FROM upcoming_releases
       ORDER BY release_date ASC, created_at ASC`
    );
    return NextResponse.json({ releases: rows });
  } catch (err) {
    console.error('GET /api/upcoming:', err);
    return NextResponse.json({ releases: [] });
  }
}
