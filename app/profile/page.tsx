'use client';

import { UserProfile } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, Calendar, CreditCard, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import useSubscriptionStore from '@/store/subscriptionStore';

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Monthly Plan',
  quarterly: '3-Month Plan',
  custom: 'Your Choice Plan',
};

const PLAN_COLOR: Record<string, string> = {
  monthly: 'text-[#D40000]',
  quarterly: 'text-amber-400',
  custom: 'text-purple-400',
};

export default function ProfilePage() {
  const { isPremium, subscription } = useSubscriptionStore();

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Lifetime';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const daysLeft = (iso: string | null) => {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400_000));
  };

  return (
    <div className="min-h-screen bg-[#000000] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Subscription card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isPremium && subscription ? (
            <div className="bg-gradient-to-br from-[#D40000]/10 to-transparent border border-[#D40000]/20 rounded-3xl p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D40000]/15 border border-[#D40000]/25 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-[#D40000]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-white font-bold text-lg">ESHANI Premium</h2>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D40000]/15 border border-[#D40000]/25 text-[10px] font-bold text-[#D40000] uppercase tracking-widest">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mt-0.5 ${PLAN_COLOR[subscription.plan] ?? 'text-[#9CA3AF]'}`}>
                    {PLAN_LABEL[subscription.plan] ?? subscription.plan}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-[#9CA3AF] text-xs mb-1.5">
                    <CreditCard className="w-3 h-3" />
                    Amount paid
                  </div>
                  <p className="text-white font-bold text-lg">₹{(subscription.amount / 100).toFixed(0)}</p>
                </div>

                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-[#9CA3AF] text-xs mb-1.5">
                    <Calendar className="w-3 h-3" />
                    Started on
                  </div>
                  <p className="text-white font-bold">{formatDate(subscription.started_at)}</p>
                </div>

                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-[#9CA3AF] text-xs mb-1.5">
                    <Clock className="w-3 h-3" />
                    {subscription.expires_at ? 'Expires on' : 'Valid until'}
                  </div>
                  {subscription.expires_at ? (
                    <>
                      <p className="text-white font-bold">{formatDate(subscription.expires_at)}</p>
                      {(() => {
                        const d = daysLeft(subscription.expires_at);
                        return d !== null && d <= 14 ? (
                          <p className="text-amber-400 text-xs mt-1 font-medium">{d} day{d !== 1 ? 's' : ''} left</p>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <p className="text-green-400 font-bold">Lifetime</p>
                  )}
                </div>
              </div>

              {/* Renew link */}
              <Link
                href="/subscribe"
                className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                <Crown className="w-4 h-4 text-[#D40000]" />
                {subscription.expires_at ? 'Renew or upgrade plan' : 'View subscription options'}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          ) : (
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">No active subscription</p>
                <p className="text-[#9CA3AF] text-sm mt-0.5">Subscribe to unlock all premium tracks and support ESHANI artists.</p>
              </div>
              <Link
                href="/subscribe"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-bold hover:bg-[#8B1111] transition-all"
              >
                <Crown className="w-4 h-4" />
                Subscribe
              </Link>
            </div>
          )}
        </motion.div>

        {/* Clerk UserProfile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-lg bg-[#111111] border border-white/[0.08] rounded-3xl',
                navbar: 'bg-[#0a0a0a] border-r border-white/[0.06]',
                navbarButton: 'text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]',
                navbarButtonActive: 'text-white bg-white/[0.08]',
                pageScrollBox: 'bg-[#111111]',
                headerTitle: 'text-white',
                headerSubtitle: 'text-[#9CA3AF]',
                formFieldLabel: 'text-[#9CA3AF]',
                formFieldInput: 'bg-[#1a1a1a] border-white/[0.1] text-white',
                badge: 'bg-[#D40000]/15 text-[#D40000]',
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
