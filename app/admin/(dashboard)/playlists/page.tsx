'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Trash2, X, Check, ListMusic, Music2 } from 'lucide-react';

interface Playlist {
  id: string; title: string; description: string; image_url: string; mood: string; song_count: number;
}
interface Song { id: string; title: string; artist: string; image_url: string; duration: number; }

const inputCls = 'w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-white/[0.08] text-white text-sm placeholder:text-[#6B7280] focus:border-[#D40000] focus:outline-none transition-colors';
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newMood, setNewMood] = useState('');

  const [managingId, setManagingId] = useState<string | null>(null);
  const [plSongs, setPlSongs] = useState<string[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/playlists').then(r => r.json()),
      fetch('/api/songs?limit=200').then(r => r.json()),
    ]).then(([p, s]) => {
      setPlaylists(p.playlists ?? []);
      setAllSongs(s.songs ?? []);
    }).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, imageUrl: newImage, mood: newMood }),
      });
      const { playlist } = await res.json();
      setPlaylists(prev => [...prev, { ...playlist, mood: newMood, song_count: 0 }]);
      setNewTitle(''); setNewDesc(''); setNewImage(''); setNewMood(''); setShowCreate(false);
    } catch { setError('Failed to create playlist'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this playlist? Songs will not be deleted.')) return;
    await fetch(`/api/admin/playlists/${id}`, { method: 'DELETE' });
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const openManage = async (pl: Playlist) => {
    setManagingId(pl.id);
    setLoadingSongs(true);
    setSongSearch('');
    try {
      const res = await fetch(`/api/playlists/${pl.id}`);
      const data = await res.json();
      setPlSongs((data.songs ?? []).map((s: Song) => s.id));
    } catch { setPlSongs([]); }
    finally { setLoadingSongs(false); }
  };

  const toggleSong = async (songId: string) => {
    const has = plSongs.includes(songId);
    if (has) {
      await fetch(`/api/admin/playlists/${managingId}/songs`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      });
      setPlSongs(prev => prev.filter(s => s !== songId));
      setPlaylists(prev => prev.map(p => p.id === managingId ? { ...p, song_count: p.song_count - 1 } : p));
    } else {
      await fetch(`/api/admin/playlists/${managingId}/songs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      });
      setPlSongs(prev => [...prev, songId]);
      setPlaylists(prev => prev.map(p => p.id === managingId ? { ...p, song_count: p.song_count + 1 } : p));
    }
  };

  const managingPl = playlists.find(p => p.id === managingId);
  const filteredSongs = allSongs.filter(s =>
    !songSearch || s.title.toLowerCase().includes(songSearch.toLowerCase()) || s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>Official Playlists</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Manage ESHANI official playlists and their songs</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors"
        >
          <Plus className="w-4 h-4" /> New Playlist
        </button>
      </div>

      {error && <div className="bg-[#D40000]/10 border border-[#D40000]/20 rounded-xl px-4 py-3 text-[#D40000] text-sm">{error}</div>}

      {showCreate && (
        <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-5 space-y-4">
          <p className="text-white font-semibold">New Official Playlist</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Title *</label>
              <input className={inputCls} placeholder="Playlist title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Mood / Vibe</label>
              <input className={inputCls} placeholder="e.g. Energetic, Moody…" value={newMood} onChange={e => setNewMood(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1.5 block">Description</label>
            <input className={inputCls} placeholder="Short description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1.5 block">Cover Image URL</label>
            <input className={inputCls} placeholder="https://..." value={newImage} onChange={e => setNewImage(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !newTitle.trim()} className="flex-1 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#D40000]" /></div>
      ) : playlists.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 text-center">
          <ListMusic className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-white font-semibold">No official playlists yet</p>
          <p className="text-[#9CA3AF] text-sm mt-1">Create your first playlist above.</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          {playlists.map((pl) => (
            <div key={pl.id} className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                {pl.image_url ? (
                  <Image src={pl.image_url} alt={pl.title} fill className="object-cover" sizes="48px" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><ListMusic className="w-5 h-5 text-[#333]" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{pl.title}</p>
                <p className="text-[#9CA3AF] text-xs mt-0.5">{pl.song_count} songs · {pl.mood || pl.description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openManage(pl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white text-xs hover:bg-white/[0.1] transition-colors"
                >
                  <Music2 className="w-3.5 h-3.5" /> Manage Songs
                </button>
                <button
                  onClick={() => handleDelete(pl.id)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#D40000] hover:bg-[#D40000]/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {managingId && managingPl && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setManagingId(null); }}>
          <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg space-y-4 my-8">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Songs in "{managingPl.title}"</p>
              <button onClick={() => setManagingId(null)} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"><X className="w-4 h-4" /></button>
            </div>
            <input className={inputCls} placeholder="Search songs…" value={songSearch} onChange={e => setSongSearch(e.target.value)} />
            {loadingSongs ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#D40000]" /></div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1">
                {filteredSongs.map(song => {
                  const included = plSongs.includes(song.id);
                  return (
                    <button
                      key={song.id}
                      onClick={() => toggleSong(song.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${included ? 'bg-[#D40000]/15 border border-[#D40000]/30' : 'hover:bg-white/[0.04] border border-transparent'}`}
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                        <Image src={song.image_url} alt={song.title} fill className="object-cover" sizes="32px" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-[#9CA3AF] text-xs truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs text-[#9CA3AF] flex-shrink-0">{fmtDur(song.duration)}</span>
                      {included && <Check className="w-4 h-4 text-[#D40000] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
