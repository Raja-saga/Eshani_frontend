'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BarChart2, Users, Play, Music, TrendingUp, Radio, RefreshCw } from 'lucide-react';

interface Stats {
  songs: number; albums: number; playlists: number; totalPlays: number; users: number;
  topSongs: { id: string; title: string; artist: string; image_url: string; plays: number }[];
  genres: { genre: string; count: number }[];
  anonPlays: number;
  authPlays: number;
}

const fmtPlays = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const COLORS = ['#D40000', '#7C3AED', '#059669', '#D97706', '#0891B2', '#DB2777'];

export default function AdminAnalyticsPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const maxPlays   = stats?.topSongs[0]?.plays ?? 1;
  const totalGenre = stats?.genres.reduce((s, g) => s + g.count, 0) ?? 1;

  const overviewCards = [
    { label: 'Registered Listeners', value: stats?.users ?? 0, icon: Users,    color: '#7C3AED', sub: 'Clerk accounts' },
    { label: 'Total Plays',          value: stats ? fmtPlays(stats.totalPlays) : 0, icon: Play, color: '#D40000', sub: 'All-time streams' },
    { label: 'Songs in Catalog',     value: stats?.songs ?? 0, icon: Music,    color: '#059669', sub: `Across ${stats?.albums ?? 0} albums` },
    { label: 'Official Playlists',   value: stats?.playlists ?? 0, icon: Radio, color: '#D97706', sub: 'Curated collections' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>
            Analytics
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Platform performance and listener insights.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141414] border border-white/[0.06] text-[#9CA3AF] hover:text-white text-xs transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <div>
              {loading ? (
                <div className="h-7 w-16 bg-white/[0.06] rounded-lg animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-white">{value}</p>
              )}
              <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listener type breakdown */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D40000]" /> Listener Types
          </h2>
          {loading ? (
            <div className="h-32 bg-white/[0.03] rounded-xl animate-pulse" />
          ) : (
            <div className="space-y-4">
              {/* Donut-style visual using stacked bars */}
              {(() => {
                const total  = (stats?.authPlays ?? 0) + (stats?.anonPlays ?? 0) || 1;
                const authPct = Math.round(((stats?.authPlays ?? 0) / total) * 100);
                const anonPct = 100 - authPct;
                return (
                  <>
                    <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full bg-[#D40000] rounded-l-full transition-all" style={{ width: `${authPct}%` }} />
                      <div className="h-full bg-[#7C3AED] rounded-r-full transition-all" style={{ width: `${anonPct}%` }} />
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Signed-in Listeners', pct: authPct, count: stats?.authPlays ?? 0, color: '#D40000' },
                        { label: 'Guest Listeners',      pct: anonPct, count: stats?.anonPlays ?? 0, color: '#7C3AED' },
                      ].map(({ label, pct, count, color }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-[#9CA3AF]">{label}</span>
                          </div>
                          <span className="text-white font-medium">{pct}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#6B7280]">Based on recent 20 plays tracked</p>
                  </>
                );
              })()}

              <div className="pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between text-xs text-[#9CA3AF]">
                  <span>Registered accounts</span>
                  <span className="text-white font-semibold">{stats?.users ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top songs */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D40000]" /> Top Songs by Plays
          </h2>
          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}</div>
          ) : !stats?.topSongs.length ? (
            <p className="text-[#9CA3AF] text-sm text-center py-8">No play data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topSongs.map((song, i) => (
                <div key={song.id} className="flex items-center gap-3 group">
                  <span className="text-xs text-[#6B7280] w-4 text-right flex-shrink-0 font-mono">{i + 1}</span>
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                    <Image src={song.image_url} alt={song.title} fill className="object-cover" sizes="36px" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-xs font-medium truncate pr-2">{song.title}</p>
                      <span className="text-[#9CA3AF] text-xs flex-shrink-0 tabular-nums">{fmtPlays(song.plays)}</span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(song.plays / maxPlays) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Genre distribution */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#D40000]" /> Genre Distribution
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}
          </div>
        ) : !stats?.genres.length ? (
          <p className="text-[#9CA3AF] text-sm text-center py-6">No genre data</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.genres.map(({ genre, count }, i) => {
              const pct = Math.round((count / totalGenre) * 100);
              return (
                <div key={genre} className="bg-[#0f0f0f] rounded-xl p-3 space-y-2 border border-white/[0.04]">
                  <div className="h-16 flex items-end">
                    <div className="w-full rounded-lg transition-all" style={{
                      height: `${Math.max(pct, 10)}%`,
                      background: COLORS[i % COLORS.length],
                      opacity: 0.8,
                    }} />
                  </div>
                  <p className="text-white text-xs font-medium truncate">{genre}</p>
                  <p className="text-[#9CA3AF] text-[10px]">{count} song{count !== 1 ? 's' : ''} · {pct}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
