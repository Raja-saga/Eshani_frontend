import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { run } from '@/lib/db';

/** POST /api/library/history — body: { songId } — records a play event */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { songId } = await req.json() as { songId: string };
    if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

    // Record in history
    await run(
      'INSERT INTO play_history (user_id, song_id) VALUES (?, ?)',
      [userId, songId]
    );

    // Increment global play count on the song
    await run('UPDATE songs SET plays = plays + 1 WHERE id = ?', [songId]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/library/history]', err);
    return NextResponse.json({ error: 'Failed to record play' }, { status: 500 });
  }
}
