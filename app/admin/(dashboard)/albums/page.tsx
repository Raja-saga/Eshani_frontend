'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Disc, Plus, Trash2, Loader2, Music, ChevronDown, ChevronUp,
  Pencil, Search, UserMinus, Save,
} from 'lucide-react';

interface Album {
  id: string;
  title: string;
  image_url: string;
  release_date: string | null;
  description: string | null;
  track_count: number;
  total_duration: number | null;
}

interface AlbumSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  image_url: string;
  position: number;
}

interface CatalogSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  image_url: string;
}

const fmtDuration = (secs: number | null) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ─── Edit Album Panel ─────────────────────────────────────────────────────────
function AlbumPanel({ album, onDeleted, onUpdated }: {
  album: Album;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Partial<Album> & { id: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [songs, setSongs] = useState<AlbumSong[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState(album.title);
  const [editDesc, setEditDesc] = useState(album.description ?? '');
  const [editDate, setEditDate] = useState(album.release_date ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Song add
  const [catalog, setCatalog] = useState<CatalogSong[]>([]);
  const [songSearch, setSongSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoadingSongs(true);
    const r = await fetch(`/api/admin/albums/${album.id}/songs`);
    const d = await r.json();
    setSongs(d.songs ?? []);
    setLoadingSongs(false);
  }, [album.id]);

  const fetchCatalog = useCallback(async () => {
    const r = await fetch('/api/songs?limit=200');
    const d = await r.json();
    setCatalog(d.songs ?? []);
  }, []);

  useEffect(() => {
    if (open) {
      fetchSongs();
      fetchCatalog();
    }
  }, [open, fetchSongs, fetchCatalog]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const res = await fetch(`/api/admin/albums/${album.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDesc.trim(),
        release_date: editDate.trim() || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg('Saved');
      onUpdated({ id: album.id, title: editTitle.trim(), description: editDesc.trim(), release_date: editDate.trim() || null });
      setTimeout(() => setSaveMsg(null), 2000);
    } else {
      setSaveMsg('Error saving');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete album "${album.title}"? Songs remain in catalog.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/albums/${album.id}`, { method: 'DELETE' });
    if (res.ok) onDeleted(album.id);
    else { alert('Delete failed'); setDeleting(false); }
  };

  const handleAddSong = async (songId: string) => {
    setAddingId(songId);
    await fetch(`/api/admin/albums/${album.id}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    await fetchSongs();
    setAddingId(null);
  };

  const handleRemoveSong = async (songId: string) => {
    setRemovingId(songId);
    await fetch(`/api/admin/albums/${album.id}/songs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    setSongs(prev => prev.filter(s => s.id !== songId));
    setRemovingId(null);
  };

  const songIds = new Set(songs.map(s => s.id));
  const filteredCatalog = catalog.filter(s =>
    !songIds.has(s.id) &&
    (songSearch === '' ||
      s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(songSearch.toLowerCase()))
  );

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
      {/* Album Header Row */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left group"
        onClick={() => setOpen(o => !o)}
      >
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-[#0f0f0f]">
          <Image src={album.image_url} alt={album.title} fill className="object-cover" unoptimized />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate group-hover:text-[#D40000] transition-colors">{album.title}</p>
          <p className="text-[#9CA3AF] text-xs mt-0.5">
            {album.track_count} track{album.track_count !== 1 ? 's' : ''}
            {album.release_date ? ` · ${new Date(album.release_date).getFullYear()}` : ''}
          </p>
          {album.description && (
            <p className="text-[#6B7280] text-xs mt-0.5 truncate">{album.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {open
            ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
            : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
        </div>
      </button>

      {/* Expanded Panel */}
      {open && (
        <div className="border-t border-white/[0.06] px-4 pb-4 space-y-5">

          {/* ── Edit Metadata ─── */}
          <div className="pt-4 space-y-3">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> Album Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1 block">Title</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50"
                />
              </div>
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1 block">Release Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D40000]/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1 block">Description</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={2}
                className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D40000] text-white text-xs font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save Changes
              </button>
              {saveMsg && (
                <span className={`text-xs font-medium ${saveMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>
                  {saveMsg}
                </span>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D40000]/10 border border-[#D40000]/20 text-[#D40000] text-xs font-semibold hover:bg-[#D40000]/20 disabled:opacity-50 transition-colors"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete Album
              </button>
            </div>
          </div>

          {/* ── Current Songs ─── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3 h-3" /> Songs in Album ({songs.length})
            </p>
            {loadingSongs ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#D40000]" /></div>
            ) : songs.length === 0 ? (
              <p className="text-[#6B7280] text-xs py-2">No songs yet. Add some from the catalog below.</p>
            ) : (
              <div className="space-y-1">
                {songs.map((song, i) => (
                  <div key={song.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0f0f0f] group/song">
                    <span className="text-xs text-[#4B5563] w-4 flex-shrink-0">{i + 1}</span>
                    <div className="relative w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a]">
                      <Image src={song.image_url} alt={song.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{song.title}</p>
                      <p className="text-[#9CA3AF] text-xs">{song.artist}</p>
                    </div>
                    <span className="text-xs text-[#6B7280] flex-shrink-0">{fmtDuration(song.duration)}</span>
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      disabled={removingId === song.id}
                      className="opacity-0 group-hover/song:opacity-100 flex-shrink-0 p-1.5 rounded-lg bg-[#D40000]/10 text-[#D40000] hover:bg-[#D40000]/20 transition-all disabled:opacity-50"
                      title="Remove from album"
                    >
                      {removingId === song.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <UserMinus className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Add Songs from Catalog ─── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3 h-3" /> Add Songs from Catalog
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input
                value={songSearch}
                onChange={e => setSongSearch(e.target.value)}
                placeholder="Search catalog songs…"
                className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredCatalog.length === 0 ? (
                <p className="text-[#6B7280] text-xs py-2">
                  {songSearch ? 'No matches' : 'All catalog songs are already in this album'}
                </p>
              ) : (
                filteredCatalog.slice(0, 50).map(song => (
                  <div key={song.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors group/cs">
                    <div className="relative w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a]">
                      <Image src={song.image_url} alt={song.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{song.title}</p>
                      <p className="text-[#9CA3AF] text-xs">{song.artist}</p>
                    </div>
                    <span className="text-xs text-[#6B7280] flex-shrink-0">{fmtDuration(song.duration)}</span>
                    <button
                      onClick={() => handleAddSong(song.id)}
                      disabled={addingId === song.id}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#D40000] text-white text-xs font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors"
                    >
                      {addingId === song.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Plus className="w-3 h-3" />}
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/albums')
      .then(r => r.json())
      .then(d => setAlbums(d.albums ?? []))
      .catch(() => setError('Failed to load albums'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleted = (id: string) => setAlbums(prev => prev.filter(a => a.id !== id));
  const handleUpdated = (updated: Partial<Album> & { id: string }) =>
    setAlbums(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>
            Albums
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {loading ? 'Loading…' : `${albums.length} album${albums.length !== 1 ? 's' : ''} — click any album to edit`}
          </p>
        </div>
        <Link
          href="/admin/upload?mode=new-album"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors"
        >
          <Plus className="w-4 h-4" /> New Album
        </Link>
      </div>

      {error && (
        <div className="bg-[#D40000]/10 border border-[#D40000]/20 rounded-2xl px-4 py-3 text-[#D40000] text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D40000]" />
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
          <Disc className="w-10 h-10 text-[#9CA3AF]" />
          <p className="text-white font-semibold">No albums yet</p>
          <p className="text-[#9CA3AF] text-sm">Create your first album by uploading a song and selecting &quot;New Album + Song&quot;.</p>
          <Link href="/admin/upload?mode=new-album" className="mt-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors">
            Create Album
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map(album => (
            <AlbumPanel
              key={album.id}
              album={album}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
