import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { run } from '@/lib/db';
import { PLANS, PlanKey } from '../create-order/route';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, amountPaise } =
    await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan: PlanKey;
      amountPaise: number;
    };

  // Verify Razorpay signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const planMeta = PLANS[plan];
  const now = new Date();
  const expiresAt = planMeta.days ? new Date(now.getTime() + planMeta.days * 86400_000).toISOString() : null;

  const subId = `sub-${userId.slice(-6)}-${Date.now()}`;

  await run(
    `INSERT INTO user_subscriptions
       (id, user_id, plan, amount, razorpay_order_id, razorpay_payment_id, razorpay_signature, status, started_at, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
    [
      subId, userId, plan, amountPaise,
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      now.toISOString(), expiresAt, now.toISOString(),
    ]
  );

  return NextResponse.json({
    success: true,
    subscription: { id: subId, plan, amount: amountPaise, started_at: now.toISOString(), expires_at: expiresAt },
  });
}
