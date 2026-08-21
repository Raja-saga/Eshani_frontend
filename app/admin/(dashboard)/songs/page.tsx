'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Music, Plus, Trash2, Loader2, Crown, Pencil, X, Check, ImageIcon, AlertCircle } from 'lucide-react';

interface Song {
  id: string; title: string; artist: string; album: string | null;
  image_url: string; audio_url: string; genre: string | null;
  duration: number; plays: number; is_premium: number;
}

const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
const fmtPlays    = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);
const toSlug      = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function EditModal({ song, onClose, onSaved }: {
  song: Song;
  onClose: () => void;
  onSaved: (id: string, imageUrl?: string, audioUrl?: string) => void;
}) {
  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [audioFile, setAudioFile]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [progress, setProgress]       = useState('');
  const [error, setError]             = useState<string | null>(null);

  const coverRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setCoverFile(f);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!coverFile && !audioFile) return setError('Select at least one file to update');
    setSaving(true); setError(null);
    try {
      const slug = toSlug(song.title);
      setProgress('Getting upload URLs…');
      const presignRes = await fetch('/api/admin/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioSlug: slug, coverSlug: slug, coverType: coverFile?.type }),
      });
      if (!presignRes.ok) throw new Error((await presignRes.json()).error || 'Presign failed');
      const { audioUploadUrl, coverUploadUrl, audioPublicUrl, coverPublicUrl } = await presignRes.json();

      let newImageUrl: string | undefined;
      let newAudioUrl: string | undefined;

      if (coverFile) {
        setProgress('Uploading new cover…');
        const r = await fetch(coverUploadUrl, { method: 'PUT', headers: { 'Content-Type': coverFile.type }, body: coverFile });
        if (!r.ok) throw new Error('Cover upload failed');
        newImageUrl = coverPublicUrl;
      }
      if (audioFile) {
        setProgress('Uploading new audio…');
        const r = await fetch(audioUploadUrl, { method: 'PUT', headers: { 'Content-Type': 'audio/mpeg' }, body: audioFile });
        if (!r.ok) throw new Error('Audio upload failed');
        newAudioUrl = audioPublicUrl;
      }

      setProgress('Saving to database…');
      const patchRes = await fetch(`/api/admin/songs/${song.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: newImageUrl, audioUrl: newAudioUrl }),
      });
      if (!patchRes.ok) throw new Error('Database update failed');

      onSaved(song.id, newImageUrl, newAudioUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false); setProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">{song.title}</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Update cover image or audio file</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.05] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-[#D40000]/10 border border-[#D40000]/20 rounded-xl px-3 py-2.5 text-[#D40000] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Current cover */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
            <Image src={coverPreview || song.image_url} alt={song.title} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs text-[#9CA3AF]">Current cover</p>
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCover} className="hidden" />
            <button onClick={() => coverRef.current?.click()} type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                coverFile ? 'border-green-500/30 text-green-400' : 'border-white/[0.1] text-[#9CA3AF] hover:text-white'}`}>
              {coverFile ? <><Check className="w-3.5 h-3.5" />{coverFile.name.slice(0, 20)}…</> : <><ImageIcon className="w-3.5 h-3.5" />Replace cover</>}
            </button>
          </div>
        </div>

        {/* Audio file */}
        <div>
          <input ref={audioRef} type="file" accept="audio/mpeg,.mp3" onChange={e => setAudioFile(e.target.files?.[0] || null)} className="hidden" />
          <button onClick={() => audioRef.current?.click()} type="button"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed text-sm transition-colors ${
              audioFile ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-white/[0.1] text-[#9CA3AF] hover:border-white/20 hover:text-white'}`}>
            {audioFile
              ? <><Check className="w-4 h-4 flex-shrink-0" /><span className="truncate">{audioFile.name}</span><span className="ml-auto text-xs">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</span></>
              : <><Music className="w-4 h-4 flex-shrink-0" />Replace audio (MP3)</>}
          </button>
        </div>

        {saving && progress && (
          <p className="text-xs text-[#9CA3AF] flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D40000]" /> {progress}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
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

  const handleSaved = (id: string, imageUrl?: string, audioUrl?: string) => {
    setSongs(prev => prev.map(s => s.id !== id ? s : {
      ...s,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(audioUrl ? { audio_url: audioUrl } : {}),
    }));
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
                          <Image src={song.image_url} alt={song.title} fill className="object-cover" sizes="36px" />
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
                        <button onClick={() => setEditing(song)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.08] transition-all" aria-label={`Edit ${song.title}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(song.id, song.title)} disabled={deleting === song.id}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#D40000] hover:bg-[#D40000]/10 transition-all disabled:opacity-50" aria-label={`Delete ${song.title}`}>
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
