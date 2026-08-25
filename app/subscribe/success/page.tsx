'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, Check, Music2 } from 'lucide-react';
import useSubscriptionStore from '@/store/subscriptionStore';

const planLabel: Record<string, string> = {
  monthly: 'Monthly', quarterly: '3 Months', custom: 'Your Choice',
};

export default function SubscribeSuccessPage() {
  const { subscription } = useSubscriptionStore();

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Lifetime';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md text-center space-y-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#D40000]/30 to-[#8B1111]/10 border border-[#D40000]/30 flex items-center justify-center mx-auto shadow-2xl shadow-[#D40000]/20"
        >
          <Crown className="w-12 h-12 text-[#D40000]" />
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs font-bold text-[#D40000] uppercase tracking-widest mb-2"
          >
            Welcome to Premium
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-3xl font-black text-white"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            You&apos;re in! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#9CA3AF] mt-2"
          >
            Your ESHANI Premium subscription is now active.
          </motion.p>
        </div>

        {/* Subscription details */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-left space-y-3"
          >
            {[
              { label: 'Plan', value: planLabel[subscription.plan] ?? subscription.plan },
              { label: 'Amount paid', value: `₹${(subscription.amount / 100).toFixed(0)}` },
              { label: 'Started', value: formatDate(subscription.started_at) },
              { label: 'Valid until', value: formatDate(subscription.expires_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">{label}</span>
                <span className="text-white font-semibold">{value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2 text-left"
        >
          {[
            'All premium tracks unlocked',
            'Ad-free listening experience',
            'High quality audio streaming',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[#D9D9D9]">
              <div className="w-5 h-5 rounded-full bg-[#D40000]/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#D40000]" />
              </div>
              {item}
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col gap-3 pt-2"
        >
          <Link
            href="/songs"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#D40000] text-white font-bold hover:bg-[#8B1111] transition-all shadow-lg shadow-[#D40000]/25"
          >
            <Music2 className="w-5 h-5" />
            Explore Premium Tracks
          </Link>
          <Link
            href="/profile"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[rgba(255,255,255,0.12)] text-[#9CA3AF] text-sm hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
          >
            View my subscription in profile
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
