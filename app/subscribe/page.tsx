'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  Crown, Check, Zap, Music2, Headphones, Shield,
  ChevronLeft, Loader2, Heart, Star, Sparkles,
} from 'lucide-react';
import useSubscriptionStore from '@/store/subscriptionStore';
import { Footer } from '@/components';

type PlanKey = 'monthly' | 'quarterly';

const PLANS = [
  {
    key: 'monthly' as PlanKey,
    name: 'Monthly',
    price: 99,
    paise: 9900,
    period: '/month',
    description: 'Perfect to get started',
    badge: null,
    perks: ['Unlimited premium tracks', 'Ad-free listening', 'High quality audio', 'Cancel anytime'],
    color: 'from-[#D40000]/20 to-[#8B1111]/10',
    border: 'border-[rgba(212,0,0,0.2)]',
  },
  {
    key: 'quarterly' as PlanKey,
    name: '3 Months',
    price: 249,
    paise: 24900,
    period: '/3 months',
    description: 'Best value — save ₹48',
    badge: 'BEST VALUE',
    perks: ['Everything in Monthly', 'Save ₹48 vs monthly', 'Priority support', 'Early access to new releases'],
    color: 'from-[#D40000]/30 to-[#8B1111]/15',
    border: 'border-[#D40000]/50',
  },
] as const;

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function SubscribePage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { isPremium, subscription, setSubscription } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('quarterly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById('razorpay-script')) { setRazorpayReady(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => setRazorpayReady(true);
    document.head.appendChild(s);
  }, []);

  const handleSubscribe = async () => {
    if (!isSignedIn) { router.push('/sign-in?redirect=/subscribe'); return; }
    setError(null);

    const plan = selectedPlan;

    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!orderRes.ok) {
        const { error: e } = await orderRes.json();
        throw new Error(e || 'Failed to create order');
      }
      const { orderId, amount: amountPaise } = await orderRes.json() as { orderId: string; amount: number };

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: 'INR',
        name: 'ESHANI',
        description: `${PLANS.find(p => p.key === plan)?.name ?? ''} Subscription`,
        order_id: orderId,
        prefill: {
          name: user?.fullName ?? '',
          email: user?.primaryEmailAddress?.emailAddress ?? '',
        },
        theme: { color: '#D40000' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // 3. Verify payment
          const verifyRes = await fetch('/api/subscription/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, plan, amountPaise }),
          });
          if (!verifyRes.ok) {
            setError('Payment verification failed. Contact support.');
            setLoading(false);
            return;
          }
          const { subscription: sub } = await verifyRes.json();
          setSubscription(sub);
          router.push('/subscribe/success');
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const formatExpiry = (iso: string | null) => {
    if (!iso) return 'Lifetime';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const planLabel: Record<string, string> = {
    monthly: 'Monthly', quarterly: '3 Months',
  };

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Back */}
      <div className="container-premium pt-24 pb-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.12)] transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-[#D40000]" />
          Back
        </Link>
      </div>

      {/* Active subscription banner */}
      {isPremium && subscription && (
        <div className="container-premium pt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#D40000]/15 to-[#8B1111]/5 border border-[#D40000]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D40000]/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-[#D40000]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg">You&apos;re already a Premium member!</p>
              <p className="text-[#9CA3AF] text-sm mt-0.5">
                Plan: <span className="text-white font-medium">{planLabel[subscription.plan] ?? subscription.plan}</span>
                {' · '}
                {subscription.expires_at
                  ? <>Expires <span className="text-white font-medium">{formatExpiry(subscription.expires_at)}</span></>
                  : <span className="text-green-400 font-medium">Lifetime access</span>
                }
              </p>
            </div>
            <Link
              href="/"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] transition-all"
            >
              Go Listen
            </Link>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <div className="container-premium pt-12 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D40000]/10 border border-[#D40000]/20 text-[#D40000] text-xs font-bold uppercase tracking-widest mb-6">
            <Crown className="w-3.5 h-3.5" />
            ESHANI Premium
          </div>
          <h1
            className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            Music without limits
          </h1>
          <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto">
            Unlock every track, support independent artists, and experience ESHANI the way it was meant to be heard.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8"
        >
          {[
            { icon: Music2, label: 'All Premium Tracks' },
            { icon: Headphones, label: 'High Quality Audio' },
            { icon: Heart, label: 'Support Artists' },
            { icon: Shield, label: 'Ad-Free' },
            { icon: Zap, label: 'Instant Access' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-xs text-[#9CA3AF]">
              <Icon className="w-3 h-3 text-[#D40000]" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Plans */}
      <div className="container-premium py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan, i) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                onClick={() => setSelectedPlan(plan.key)}
                className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-200 bg-gradient-to-b ${plan.color} ${
                  isSelected ? plan.border + ' shadow-lg shadow-[#D40000]/10' : 'border-[rgba(255,255,255,0.07)]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#D40000] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      <Star className="w-2.5 h-2.5" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-[#D40000] border-[#D40000]' : 'border-[rgba(255,255,255,0.2)]'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-[#D40000] uppercase tracking-widest mb-1">{plan.name}</p>
                  <p className="text-[#9CA3AF] text-xs">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-sm text-[#9CA3AF] mb-1">₹</span>
                  <span className="text-5xl font-black text-white leading-none">{plan.price}</span>
                  <span className="text-[#9CA3AF] text-sm mb-1">{plan.period}</span>
                </div>

                {/* Perks */}
                <ul className="space-y-2">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-[#D9D9D9]">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[#D40000]' : 'text-[#9CA3AF]'}`} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto mt-10 space-y-4"
        >
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[#D40000] text-sm text-center bg-[#D40000]/10 border border-[#D40000]/20 rounded-xl px-4 py-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {isLoaded && !isSignedIn ? (
            <Link
              href="/sign-in?redirect=/subscribe"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#D40000] text-white text-base font-bold hover:bg-[#8B1111] transition-all shadow-lg shadow-[#D40000]/30"
            >
              <Crown className="w-5 h-5" />
              Sign in to Subscribe
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(212,0,0,0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubscribe}
              disabled={loading || !razorpayReady}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#D40000] text-white text-base font-bold hover:bg-[#8B1111] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#D40000]/30"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  {`Subscribe for ₹${PLANS.find(p => p.key === selectedPlan)?.price}`}
                </>
              )}
            </motion.button>
          )}

          <p className="text-center text-xs text-[#9CA3AF]">
            Secured by Razorpay · UPI, Cards, Net Banking accepted
          </p>
        </motion.div>
      </div>

      {/* Testimonial / trust section */}
      <div className="container-premium pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="h-px bg-[rgba(255,255,255,0.07)] mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Sparkles, stat: '100%', label: 'Independent artists' },
              { icon: Music2, stat: 'All tracks', label: 'Unlocked with premium' },
              { icon: Heart, stat: 'Direct', label: 'Support to creators' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#D40000]/10 border border-[#D40000]/20 flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-[#D40000]" />
                </div>
                <p className="text-xl font-black text-white">{stat}</p>
                <p className="text-xs text-[#9CA3AF]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
