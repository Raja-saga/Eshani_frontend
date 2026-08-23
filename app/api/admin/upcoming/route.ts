import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, run } from '@/lib/db';
import { randomUUID } from 'crypto';

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

export async function GET() {
  const { sessionClaims } = await auth();
  if ((sessionClaims?.metadata as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await ensureTable();
    const rows = await query<UpcomingRow>(
      `SELECT id, title, artist, image_url, release_date, genre, pre_orders, created_at
       FROM upcoming_releases ORDER BY release_date ASC, created_at ASC`
    );
    return NextResponse.json({ releases: rows });
  } catch (err) {
    console.error('GET /api/admin/upcoming:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { sessionClaims } = await auth();
  if ((sessionClaims?.metadata as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body: { title: string; artist?: string; imageUrl?: string; releaseDate?: string; genre?: string } = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await ensureTable();

    const id = randomUUID();
    await run(
      `INSERT INTO upcoming_releases (id, title, artist, image_url, release_date, genre)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.title.trim(),
        (body.artist ?? 'ESHANI').trim(),
        body.imageUrl ?? '',
        body.releaseDate ?? null,
        body.genre ?? '',
      ]
    );

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/upcoming:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
