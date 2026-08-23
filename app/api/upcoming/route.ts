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
}

export async function GET() {
  try {
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

    const rows = await query<UpcomingRow>(
      `SELECT id, title, artist, image_url, release_date, genre, pre_orders
       FROM upcoming_releases
       ORDER BY release_date ASC, created_at ASC`
    );

    const releases = rows.map(r => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      image: r.image_url,
      releaseDate: r.release_date ?? '',
      genre: r.genre ?? '',
      preOrders: r.pre_orders,
    }));

    return NextResponse.json({ releases }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('GET /api/upcoming:', err);
    return NextResponse.json({ releases: [] });
  }
}
