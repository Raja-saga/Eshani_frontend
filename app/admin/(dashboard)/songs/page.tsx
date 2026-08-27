'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Music, Plus, Trash2, Loader2, Crown, Pencil, X, Check,
  ImageIcon, AlertCircle, ChevronDown,
} from 'lucide-react';

interface Song {
  id: string; title: string; artist: string; album: string | null;
  image_url: string; audio_url: string; genre: string | null;
  duration: number; plays: number; is_premium: number;
  release_date?: string | null;
}

const GENRE_SUGGESTIONS = [
  'Pop', 'Hip-Hop', 'R&B', 'Soul', 'Jazz', 'Classical',
  'Electronic', 'Dance', 'Indie', 'Rock', 'Alternative',
  'Latin', 'Afrobeats', 'Reggae', 'Gospel',
];

const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
const fmtPlays    = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);
const toSlug      = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#9CA3AF] mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-white/[0.08] text-white text-sm placeholder:text-[#6B7280] focus:border-[#D40000] focus:outline-none transition-colors';

function EditModal({ song, onClose, onSaved }: {
  song: Song;
  onClose: () => void;
  onSaved: (id: string, updates: Partial<Song>) => void;
}) {
  const [title, setTitle]         = useState(song.title);
  const [artist, setArtist]       = useState(song.artist);
  const [genre, setGenre]         = useState(song.genre ?? '');
  const [isPremium, setIsPremium] = useState(song.is_premium === 1);
  const [releaseDate, setReleaseDate] = useState(song.release_date ?? '');
  const [duration, setDuration]   = useState(song.duration);

  const [showAlbumChange, setShowAlbumChange] = useState(false);
  const [albumId, setAlbumId]     = useState('standalone');
  const [albums, setAlbums]       = useState<{ id: string; title: string }[]>([]);

  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [audioFile, setAudioFile]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState('');

  const [saving, setSaving]   = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError]     = useState<string | null>(null);

  const coverRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showAlbumChange) return;
    fetch('/api/albums')
      .then(r => r.json())
      .then(d => setAlbums(d.albums ?? []))
      .catch(() => {});
  }, [showAlbumChange]);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setCoverFile(f);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setAudioFile(f);
    const url = URL.createObjectURL(f);
    const a = new Audio(url);
    a.onloadedmetadata = () => { setDuration(Math.round(a.duration)); URL.revokeObjectURL(url); };
  };

  const handleSave = async () => {
    if (!title.trim()) return setError('Title is required');
    setSaving(true); setError(null);
    try {
      const slug = toSlug(title);
      let newImageUrl: string | undefined;
      let newAudioUrl: string | undefined;

      // Cover: direct URL takes priority, else upload file through server
      if (coverUrlInput.trim()) {
        newImageUrl = coverUrlInput.trim();
      } else if (coverFile) {
        setProgress('Uploading cover image…');
        const ext = coverFile.type === 'image/png' ? 'png' : coverFile.type === 'image/webp' ? 'webp' : 'jpg';
        const r = await fetch('/api/admin/upload-file', {
          method: 'POST',
          headers: { 'x-file-key': `covers/${slug}.${ext}`, 'x-content-type': coverFile.type },
          body: coverFile,
        });
        if (!r.ok) throw new Error((await r.json()).error || 'Cover upload failed');
        ({ publicUrl: newImageUrl } = await r.json());
      }

      if (audioFile) {
        setProgress('Uploading audio…');
        const r = await fetch('/api/admin/upload-file', {
          method: 'POST',
          headers: { 'x-file-key': `songs/${slug}.mp3`, 'x-content-type': 'audio/mpeg' },
          body: audioFile,
        });
        if (!r.ok) throw new Error((await r.json()).error || 'Audio upload failed');
        ({ publicUrl: newAudioUrl } = await r.json());
      }

      setProgress('Saving to database…');
      const patchBody: Record<string, unknown> = {
        title: title.trim(),
        artist: artist.trim() || 'ESHANI',
        genre: genre.trim() || null,
        duration,
        isPremium,
        releaseDate: releaseDate || null,
      };
      if (newImageUrl) patchBody.imageUrl = newImageUrl;
      if (newAudioUrl) patchBody.audioUrl = newAudioUrl;
      if (showAlbumChange) patchBody.albumId = albumId;

      const patchRes = await fetch(`/api/admin/songs/${song.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      if (!patchRes.ok) throw new Error('Database update failed');

      onSaved(song.id, {
        title: title.trim(),
        artist: artist.trim() || 'ESHANI',
        genre: genre.trim() || null,
        duration,
        is_premium: isPremium ? 1 : 0,
        release_date: releaseDate || null,
        ...(newImageUrl ? { image_url: newImageUrl } : {}),
        ...(newAudioUrl ? { audio_url: newAudioUrl } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false); setProgress('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg space-y-5 my-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-base">Edit Song</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5 truncate max-w-[280px]">{song.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.05] transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-[#D40000]/10 border border-[#D40000]/20 rounded-xl px-3 py-2.5 text-[#D40000] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Cover + audio replacement row */}
        <div className="flex gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-white/[0.06]">
          {/* Cover */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a]">
              <Image src={coverPreview ?? (coverUrlInput || song.image_url)} alt={song.title} fill className="object-cover" sizes="80px" unoptimized />
            </div>
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCover} className="hidden" />
            <button
              onClick={() => coverRef.current?.click()} type="button"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed text-xs transition-colors ${
                coverFile ? 'border-green-500/40 text-green-400' : 'border-white/[0.12] text-[#9CA3AF] hover:text-white'}`}
            >
              {coverFile ? <Check className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              {coverFile ? 'Ready' : 'Upload file'}
            </button>
          </div>

          {/* Audio */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            <div>
              <p className="text-xs text-[#9CA3AF] mb-0.5">Current audio</p>
              <p className="text-xs text-white truncate">{song.audio_url.split('/').pop() ?? 'audio.mp3'}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{fmtDuration(duration)}</p>
            </div>
            <input ref={audioRef} type="file" accept="audio/mpeg,.mp3" onChange={handleAudio} className="hidden" />
            <button
              onClick={() => audioRef.current?.click()} type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                audioFile ? 'border-green-500/40 text-green-400' : 'border-white/[0.12] text-[#9CA3AF] hover:text-white'}`}
            >
              {audioFile
                ? <><Check className="w-3 h-3" /><span className="truncate">{audioFile.name.slice(0, 22)}</span><span className="ml-auto text-[10px] flex-shrink-0">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</span></>
                : <><Music className="w-3 h-3" />Replace MP3</>}
            </button>
          </div>
        </div>

        {/* Cover image URL (alternative to file upload) */}
        <Field label="Or paste cover image URL">
          <input
            type="url"
            value={coverUrlInput}
            onChange={e => { setCoverUrlInput(e.target.value); if (coverFile) setCoverFile(null); }}
            className={inputCls}
            placeholder="https://pub-....r2.dev/covers/..."
          />
        </Field>

        {/* Metadata fields */}
        <div className="space-y-3">
          <Field label="Title *">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Song title" />
          </Field>

          <Field label="Artist">
            <input type="text" value={artist} onChange={e => setArtist(e.target.value)} className={inputCls} placeholder="ESHANI" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Genre">
              <input
                type="text" list="edit-genre-list"
                value={genre} onChange={e => setGenre(e.target.value)}
                className={inputCls} placeholder="e.g. Pop"
              />
              <datalist id="edit-genre-list">
                {GENRE_SUGGESTIONS.map(g => <option key={g} value={g} />)}
              </datalist>
            </Field>

            <Field label="Release Date">
              <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (auto-detected)">
              <input type="text" value={fmtDuration(duration)} readOnly className={`${inputCls} cursor-not-allowed opacity-60`} />
            </Field>

            <Field label="Premium">
              <button
                type="button"
                onClick={() => setIsPremium(p => !p)}
                className={`w-full h-[38px] px-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 ${
                  isPremium
                    ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                    : 'bg-[#0f0f0f] border-white/[0.08] text-[#9CA3AF] hover:text-white'}`}
              >
                <Crown className="w-3.5 h-3.5" />
                {isPremium ? 'Premium' : 'Free'}
              </button>
            </Field>
          </div>

          {/* Album assignment (optional) */}
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAlbumChange(p => !p)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              <span>
                Change album assignment
                {song.album && !showAlbumChange && (
                  <span className="ml-2 text-xs text-[#6B7280]">(currently: {song.album})</span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAlbumChange ? 'rotate-180' : ''}`} />
            </button>
            {showAlbumChange && (
              <div className="px-4 pb-4">
                <select
                  value={albumId}
                  onChange={e => setAlbumId(e.target.value)}
                  className={`${inputCls} mt-1`}
                >
                  <option value="standalone">— No album (standalone) —</option>
                  {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {saving && progress && (
          <p className="text-xs text-[#9CA3AF] flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D40000]" /> {progress}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSongsPage() {
  const [songs, setSongs]       = useState<Song[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing]   = useState<Song | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/songs?limit=100')
      .then(r => r.json())
      .then(d => setSongs(d.songs ?? []))
      .catch(() => setError('Failed to load songs'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?\n\nThis will remove the song from all albums and playlists. This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/songs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSongs(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete song. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (id: string, updates: Partial<Song>) => {
    setSongs(prev => prev.map(s => s.id !== id ? s : { ...s, ...updates }));
  };

  return (
    <>
      {editing && <EditModal song={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}

      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>Songs</h1>
            <p className="text-[#9CA3AF] text-sm mt-1">
              {loading ? 'Loading…' : `${songs.length} song${songs.length !== 1 ? 's' : ''} in catalog`}
            </p>
          </div>
          <Link href="/admin/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors">
            <Plus className="w-4 h-4" /> Add Song
          </Link>
        </div>

        {error && <div className="bg-[#D40000]/10 border border-[#D40000]/20 rounded-2xl px-4 py-3 text-[#D40000] text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#D40000]" /></div>
        ) : songs.length === 0 ? (
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
            <Music className="w-10 h-10 text-[#9CA3AF]" />
            <p className="text-white font-semibold">No songs yet</p>
            <p className="text-[#9CA3AF] text-sm">Upload your first track to get started.</p>
            <Link href="/admin/upload" className="mt-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors">Upload Song</Link>
          </div>
        ) : (
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                  <th className="text-left px-4 py-3 w-10">#</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Album</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Genre</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">Plays</th>
                  <th className="text-right px-4 py-3">Time</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {songs.map((song, i) => (
                  <tr key={song.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                          <Image src={song.image_url} alt={song.title} fill className="object-cover" sizes="36px" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{song.title}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[#9CA3AF] text-xs truncate">{song.artist}</p>
                            {song.is_premium === 1 && <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs hidden md:table-cell truncate max-w-[120px]">{song.album ?? '—'}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs hidden lg:table-cell">{song.genre ?? '—'}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs text-right hidden sm:table-cell tabular-nums">{fmtPlays(song.plays)}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs text-right tabular-nums">{fmtDuration(song.duration)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(song)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.08] transition-all"
                          aria-label={`Edit ${song.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(song.id, song.title)}
                          disabled={deleting === song.id}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#D40000] hover:bg-[#D40000]/10 transition-all disabled:opacity-50"
                          aria-label={`Delete ${song.title}`}
                        >
                          {deleting === song.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
