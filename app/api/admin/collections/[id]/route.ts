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
  const { name, description, imageUrl } = await req.json();
  const sets: string[] = []; const vals: (string | null)[] = [];
  if (name !== undefined)      { sets.push('name = ?');        vals.push(name.trim()); }
  if (description !== undefined){ sets.push('description = ?'); vals.push(description.trim()); }
  if (imageUrl !== undefined)  { sets.push('image_url = ?');   vals.push(imageUrl.trim()); }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  vals.push(id);
  await run(`UPDATE collections SET ${sets.join(', ')} WHERE id = ?`, vals);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { sessionClaims } = await auth();
  if (!isAdmin(sessionClaims?.metadata?.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await run('DELETE FROM collection_songs WHERE collection_id = ?', [id]);
  await run('DELETE FROM collections WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
