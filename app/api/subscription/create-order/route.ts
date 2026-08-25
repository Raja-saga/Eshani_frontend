import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  monthly: { label: 'Monthly', amount: 9900, days: 30 },       // ₹99
  quarterly: { label: '3 Months', amount: 24900, days: 90 },   // ₹249
  custom: { label: 'Your Choice', amount: null, days: null },   // custom
} as const;

export type PlanKey = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan, customAmount } = await req.json() as { plan: PlanKey; customAmount?: number };

  if (!PLANS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  let amountPaise: number;
  if (plan === 'custom') {
    if (!customAmount || customAmount < 50) {
      return NextResponse.json({ error: 'Minimum custom amount is ₹50' }, { status: 400 });
    }
    amountPaise = Math.round(customAmount * 100);
  } else {
    amountPaise = PLANS[plan].amount!;
  }

  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      notes: { userId, plan },
    });
    return NextResponse.json({ orderId: order.id, amount: amountPaise, currency: 'INR' });
  } catch (err) {
    console.error('[Razorpay create-order]', err);
    return NextResponse.json({ error: 'Payment service unavailable. Please try again later.' }, { status: 502 });
  }
}
