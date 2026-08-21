import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Remove song links then the album record (songs themselves remain)
  await run('DELETE FROM album_songs WHERE album_id = ?', [id]);
  await run('DELETE FROM albums      WHERE id = ?',       [id]);

  return NextResponse.json({ success: true });
}
