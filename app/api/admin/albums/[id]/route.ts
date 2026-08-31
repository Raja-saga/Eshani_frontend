import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

async function isAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === 'admin';
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { title, description, release_date, image_url } = await req.json();

  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (release_date !== undefined) { fields.push('release_date = ?'); values.push(release_date); }
  if (image_url !== undefined) { fields.push('image_url = ?'); values.push(image_url); }

  if (fields.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  values.push(id);
  await run(`UPDATE albums SET ${fields.join(', ')} WHERE id = ?`, values);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  await run('DELETE FROM album_songs WHERE album_id = ?', [id]);
  await run('DELETE FROM albums      WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
