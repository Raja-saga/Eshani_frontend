import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { run, queryOne } from '@/lib/db';

/** POST /api/library/like  — body: { songId }  → like a song */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { songId } = await req.json() as { songId: string };
    if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

    await run(
      'INSERT OR IGNORE INTO user_likes (user_id, song_id) VALUES (?, ?)',
      [userId, songId]
    );

    return NextResponse.json({ liked: true, songId });
  } catch (err) {
    console.error('[POST /api/library/like]', err);
    return NextResponse.json({ error: 'Failed to like song' }, { status: 500 });
  }
}

/** DELETE /api/library/like  — body: { songId }  → unlike a song */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { songId } = await req.json() as { songId: string };
    if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

    await run(
      'DELETE FROM user_likes WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );

    return NextResponse.json({ liked: false, songId });
  } catch (err) {
    console.error('[DELETE /api/library/like]', err);
    return NextResponse.json({ error: 'Failed to unlike song' }, { status: 500 });
  }
}

/** GET /api/library/like?songId=xxx — check if current user likes a specific song */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ liked: false });

    const songId = req.nextUrl.searchParams.get('songId');
    if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

    const row = await queryOne(
      'SELECT 1 AS found FROM user_likes WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );

    return NextResponse.json({ liked: !!row, songId });
  } catch (err) {
    console.error('[GET /api/library/like]', err);
    return NextResponse.json({ error: 'Failed to check like' }, { status: 500 });
  }
}
