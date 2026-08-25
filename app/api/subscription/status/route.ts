import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';

export interface SubscriptionRecord {
  id: string;
  plan: string;
  amount: number;
  status: string;
  started_at: string;
  expires_at: string | null;
  razorpay_payment_id: string | null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ subscription: null });

  const sub = await queryOne<SubscriptionRecord>(
    `SELECT id, plan, amount, status, started_at, expires_at, razorpay_payment_id
     FROM user_subscriptions
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (!sub) return NextResponse.json({ subscription: null });

  // Auto-expire if past expires_at — mark DB row and return null
  if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
    await run(
      `UPDATE user_subscriptions SET status = 'expired' WHERE id = ?`,
      [sub.id]
    ).catch(() => {});
    return NextResponse.json({ subscription: null, expired: true });
  }

  return NextResponse.json({ subscription: sub });
}
