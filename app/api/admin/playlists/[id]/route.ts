import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };
function isAdmin(role: unknown) { return role === 'admin'; }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { title, description, imageUrl, mood } = await req.json();
  const sets: string[] = []; const vals: (string | null)[] = [];
  if (title !== undefined)       { sets.push('title = ?');       vals.push(title.trim()); }
  if (description !== undefined) { sets.push('description = ?'); vals.push(description.trim()); }
  if (imageUrl !== undefined)    { sets.push('image_url = ?');   vals.push(imageUrl.trim()); }
  if (mood !== undefined)        { sets.push('mood = ?');        vals.push(mood.trim()); }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  vals.push(id);
  await run(`UPDATE playlists SET ${sets.join(', ')} WHERE id = ?`, vals);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await run('DELETE FROM playlist_songs WHERE playlist_id = ?', [id]);
  await run('DELETE FROM playlists WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
