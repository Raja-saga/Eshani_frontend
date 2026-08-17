import { BarChart2 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          Analytics
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          Streams, listener growth, and revenue insights.
        </p>
      </div>

      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#D40000]/10 flex items-center justify-center">
          <BarChart2 className="w-7 h-7 text-[#D40000]" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-white font-semibold">Analytics not yet implemented</p>
          <p className="text-[#9CA3AF] text-sm max-w-xs">
            Listener stats and revenue data will appear here once the analytics pipeline is
            connected in the next development phase.
          </p>
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#D40000] bg-[#D40000]/10 px-3 py-1 rounded-full">
          Coming soon
        </span>
      </div>
    </div>
  );
}
