import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

const DEFAULTS: Record<string, string> = {
  platform_name:    'ESHANI',
  admin_email:      'eshani.admin01@gmail.com',
  instagram_url:    '',
  youtube_url:      '',
  spotify_url:      '',
  twitter_url:      '',
  apple_music_url:  '',
  contact_enabled:  'true',
  new_release_banner: 'false',
};

async function ensureTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `, []);
}

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await ensureTable();
  const rows = await query<{ key: string; value: string }>('SELECT key, value FROM settings');
  const map: Record<string, string> = { ...DEFAULTS };
  for (const { key, value } of rows) map[key] = value;
  return NextResponse.json({ settings: map });
}

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await ensureTable();
  const body: Record<string, string> = await req.json();

  for (const [key, value] of Object.entries(body)) {
    await run(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value]
    );
  }

  return NextResponse.json({ success: true });
}
