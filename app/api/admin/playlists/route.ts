import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

function isAdmin(role: unknown) { return role === 'admin'; }

export async function GET() {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const playlists = await query<{
    id: string; title: string; description: string; image_url: string; mood: string; song_count: number;
  }>(`SELECT p.*, COUNT(ps.song_id) as song_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      WHERE p.is_official = 1
      GROUP BY p.id ORDER BY p.created_at ASC`);
  return NextResponse.json({ playlists });
}

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, description = '', imageUrl = '', mood = '' } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const id = `pl-${Date.now()}`;
  await run(
    'INSERT INTO playlists (id, title, description, image_url, curator, mood, is_official) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [id, title.trim(), description.trim(), imageUrl.trim(), 'ESHANI', mood.trim()]
  );
  return NextResponse.json({ playlist: { id, title: title.trim(), description: description.trim(), image_url: imageUrl.trim() } }, { status: 201 });
}
