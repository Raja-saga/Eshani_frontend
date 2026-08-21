'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Music, Disc, BarChart2, Users, Play, TrendingUp, ListMusic } from 'lucide-react';

interface Stats {
  songs: number; albums: number; playlists: number; totalPlays: number; users: number;
  topSongs: { id: string; title: string; artist: string; image_url: string; plays: number }[];
  genres: { genre: string; count: number }[];
}

const fmtPlays = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening');
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const maxPlays = stats?.topSongs[0]?.plays ?? 1;

  const statCards = [
    { label: 'Songs',       value: stats?.songs       ?? '—', icon: Music,     color: '#D40000' },
    { label: 'Albums',      value: stats?.albums      ?? '—', icon: Disc,      color: '#7C3AED' },
    { label: 'Total Plays', value: stats ? fmtPlays(stats.totalPlays) : '—', icon: Play, color: '#059669' },
    { label: 'Listeners',   value: stats?.users       ?? '—', icon: Users,     color: '#D97706' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>
          {greeting} 
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Here&apos;s what&apos;s happening with ESHANI today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top songs */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D40000]" /> Top Songs
            </h2>
            <Link href="/admin/songs" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">View all →</Link>
          </div>
          {!stats ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}</div>
          ) : stats.topSongs.length === 0 ? (
            <p className="text-[#9CA3AF] text-sm text-center py-6">No songs yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topSongs.map((song, i) => (
                <div key={song.id} className="flex items-center gap-3">
                  <span className="text-xs text-[#9CA3AF] w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                    <Image src={song.image_url} alt={song.title} fill className="object-cover" sizes="32px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{song.title}</p>
                    <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D40000] rounded-full" style={{ width: `${(song.plays / maxPlays) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-[#9CA3AF] flex-shrink-0 tabular-nums">{fmtPlays(song.plays)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Genre breakdown */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#D40000]" /> Genre Breakdown
          </h2>
          {!stats ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}</div>
          ) : stats.genres.length === 0 ? (
            <p className="text-[#9CA3AF] text-sm text-center py-6">No genre data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.genres.map(({ genre, count }) => (
                <div key={genre} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white">{genre}</span>
                    <span className="text-[#9CA3AF]">{count} song{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#D40000] to-[#7C3AED] rounded-full"
                      style={{ width: `${(count / (stats?.songs || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Upload Song',  href: '/admin/upload',    icon: Music,     color: '#D40000' },
            { label: 'Manage Songs', href: '/admin/songs',     icon: ListMusic, color: '#7C3AED' },
            { label: 'Albums',       href: '/admin/albums',    icon: Disc,      color: '#059669' },
            { label: 'Analytics',    href: '/admin/analytics', icon: BarChart2, color: '#D97706' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141414] border border-white/[0.06] hover:border-white/[0.1] transition-colors group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-sm text-[#9CA3AF] group-hover:text-white transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
