import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { run } from '@/lib/db';

function isAdmin(sessionClaims: Record<string, unknown> | null) {
  return (sessionClaims?.metadata as { role?: string } | null)?.role === 'admin';
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body: { title?: string; artist?: string; imageUrl?: string; releaseDate?: string | null; genre?: string } = await req.json();

  const sets: string[] = [];
  const vals: (string | null)[] = [];

  if (body.title !== undefined)       { sets.push('title = ?');        vals.push(body.title.trim()); }
  if (body.artist !== undefined)      { sets.push('artist = ?');       vals.push(body.artist.trim()); }
  if (body.imageUrl !== undefined)    { sets.push('image_url = ?');    vals.push(body.imageUrl); }
  if (body.releaseDate !== undefined) { sets.push('release_date = ?'); vals.push(body.releaseDate ?? null); }
  if (body.genre !== undefined)       { sets.push('genre = ?');        vals.push(body.genre); }

  if (sets.length === 0) {
    return NextResponse.json({ ok: true });
  }

  await run(`UPDATE upcoming_releases SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await run('DELETE FROM upcoming_releases WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
