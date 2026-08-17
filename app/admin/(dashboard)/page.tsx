import { currentUser } from '@clerk/nextjs/server';
import { Music, Disc, Radio, BarChart2 } from 'lucide-react';

const statCards = [
  { label: 'Total Songs', value: '—', icon: Music, color: '#D40000' },
  { label: 'Albums', value: '—', icon: Disc, color: '#D40000' },
  { label: 'Releases', value: '—', icon: Radio, color: '#D40000' },
  { label: 'Total Plays', value: '—', icon: BarChart2, color: '#D40000' },
];

export default async function AdminDashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? 'Admin';

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          Welcome back, {firstName}
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          Here&apos;s an overview of ESHANI.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-3"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${color}18` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder notice */}
      <div className="bg-[#141414] border border-[#D40000]/20 rounded-2xl p-6 text-center space-y-2">
        <p className="text-sm font-semibold text-[#D40000]">Foundation Phase</p>
        <p className="text-[#9CA3AF] text-sm">
          Dashboard data will populate once the backend is connected. Use the sidebar to
          navigate to Songs, Albums, and Releases management.
        </p>
      </div>
    </div>
  );
}
