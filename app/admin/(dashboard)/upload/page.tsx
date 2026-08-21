'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Music, Disc, Check, AlertCircle, ImageIcon, Loader2 } from 'lucide-react';

type Mode = 'standalone' | 'add-to-album' | 'new-album';

interface Album { id: string; title: string }

const GENRE_SUGGESTIONS = ['R&B / Pop', 'Pop', 'Hip-Hop', 'Kannada Hip-Hop', 'Indie Pop', 'R&B', 'Electronic', 'Kannada Pop', 'Soul', 'Folk', 'Jazz', 'Classical', 'Afrobeats', 'Latin', 'Country'];

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const fmtDuration = (secs: number) =>
  `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

export default function AdminUploadPage() {
  const searchParams = useSearchParams();
  const initialMode  = (searchParams.get('mode') as Mode) ?? 'standalone';
  const [mode, setMode]               = useState<Mode>(initialMode);
  const [albums, setAlbums]           = useState<Album[]>([]);
  const [title, setTitle]             = useState('');
  const [artist, setArtist]           = useState('ESHANI');
  const [genre, setGenre]             = useState('');
  const [duration, setDuration]       = useState(0);
  const [isPremium, setIsPremium]     = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [albumId, setAlbumId]         = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDesc, setNewAlbumDesc]   = useState('');
  const [audioFile, setAudioFile]     = useState<File | null>(null);
  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/albums')
      .then(r => r.json())
      .then(d => setAlbums(d.albums ?? []))
      .catch(() => {});
  }, []);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    const el = document.createElement('audio');
    el.preload = 'metadata';
    el.onloadedmetadata = () => { setDuration(Math.round(el.duration)); URL.revokeObjectURL(el.src); };
    el.src = URL.createObjectURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle(''); setArtist('ESHANI'); setGenre(''); setDuration(0);
    setIsPremium(false); setReleaseDate(''); setAlbumId('');
    setNewAlbumTitle(''); setNewAlbumDesc('');
    setAudioFile(null); setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    if (audioRef.current) audioRef.current.value = '';
    if (coverRef.current) coverRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim())                              return setError('Song title is required');
    if (!audioFile)                                 return setError('Please select an MP3 file');
    if (!coverFile)                                 return setError('Please select a cover image');
    if (mode === 'add-to-album' && !albumId)        return setError('Please select an album');
    if (mode === 'new-album' && !newAlbumTitle.trim()) return setError('Album title is required');

    setUploading(true);
    try {
      const slug = toSlug(title.trim());

      setProgress('Preparing upload…');
      const presignRes = await fetch('/api/admin/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioSlug: slug, coverSlug: slug, coverType: coverFile.type }),
      });
      if (!presignRes.ok) {
        const { error: e } = await presignRes.json();
        throw new Error(e || 'Could not get upload URLs');
      }
      const { audioUploadUrl, coverUploadUrl, audioPublicUrl, coverPublicUrl } = await presignRes.json();

      setProgress('Uploading audio file…');
      const ar = await fetch(audioUploadUrl, { method: 'PUT', headers: { 'Content-Type': 'audio/mpeg' }, body: audioFile });
      if (!ar.ok) throw new Error('Audio upload to R2 failed');

      setProgress('Uploading cover image…');
      const cr = await fetch(coverUploadUrl, { method: 'PUT', headers: { 'Content-Type': coverFile.type }, body: coverFile });
      if (!cr.ok) throw new Error('Cover upload to R2 failed');

      setProgress('Saving to database…');
      const saveRes = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim() || 'ESHANI',
          genre: genre || null,
          duration,
          isPremium,
          releaseDate: releaseDate || null,
          audioUrl: audioPublicUrl,
          imageUrl: coverPublicUrl,
          albumId:  mode === 'add-to-album' ? albumId : null,
          newAlbumTitle:       mode === 'new-album' ? newAlbumTitle.trim() : null,
          newAlbumDescription: mode === 'new-album' ? newAlbumDesc.trim()  : null,
        }),
      });
      if (!saveRes.ok) {
        const { error: e } = await saveRes.json();
        throw new Error(e || 'Failed to save song record');
      }

      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  // ── shared input class ────────────────────────────────────────────────────
  const input =
    'w-full bg-[#0f0f0f] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#D40000]/40 transition-colors';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>
          Upload
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Add new music to the ESHANI catalog.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm font-medium">Song uploaded and saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-[#D40000]/10 border border-[#D40000]/20 rounded-2xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-[#D40000] flex-shrink-0" />
          <p className="text-[#D40000] text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Mode selector ─────────────────────────────────────────────── */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-white">What are you adding?</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'standalone',    label: 'Standalone Song',   Icon: Music  },
              { value: 'add-to-album',  label: 'Song → Album',      Icon: Disc   },
              { value: 'new-album',     label: 'New Album + Song',  Icon: Upload },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value} type="button" onClick={() => setMode(value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                  mode === value
                    ? 'bg-[#D40000]/15 border-[#D40000]/30 text-white'
                    : 'border-white/[0.06] text-[#9CA3AF] hover:border-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${mode === value ? 'text-[#D40000]' : ''}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── New album details ─────────────────────────────────────────── */}
        {mode === 'new-album' && (
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Disc className="w-4 h-4 text-[#D40000]" /> New Album
            </p>
            <div>
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Album Title *</label>
              <input value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} placeholder="e.g. Asali Vol. 2" className={input} />
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Description</label>
              <textarea value={newAlbumDesc} onChange={e => setNewAlbumDesc(e.target.value)} placeholder="What's this album about?" rows={2}
                className={input + ' resize-none'} />
            </div>
          </div>
        )}

        {/* ── Existing album picker ─────────────────────────────────────── */}
        {mode === 'add-to-album' && (
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Disc className="w-4 h-4 text-[#D40000]" /> Select Album
            </p>
            <select value={albumId} onChange={e => setAlbumId(e.target.value)} className={input}>
              <option value="">— Choose an album —</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
        )}

        {/* ── Song details ──────────────────────────────────────────────── */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-[#D40000]" /> Song Details
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Song Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. SWAY" className={input} />
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Artist</label>
              <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="ESHANI" className={input} />
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Genre</label>
              <input
                list="genre-list"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder="Type or select a genre…"
                className={input}
              />
              <datalist id="genre-list">
                {GENRE_SUGGESTIONS.map(g => <option key={g} value={g} />)}
              </datalist>
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Release Date</label>
              <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className={input} />
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">
                Duration{duration > 0 && <span className="text-[#D40000] ml-1">({fmtDuration(duration)})</span>}
              </label>
              <input
                type="number" value={duration || ''} onChange={e => setDuration(parseInt(e.target.value) || 0)}
                placeholder="Auto-detected from MP3"
                className={input}
              />
            </div>
          </div>

          {/* Premium toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm text-white font-medium">Premium only</p>
              <p className="text-xs text-[#9CA3AF]">Restrict to premium subscribers</p>
            </div>
            <button
              type="button" onClick={() => setIsPremium(!isPremium)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isPremium ? 'bg-[#D40000]' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPremium ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── File pickers ──────────────────────────────────────────────── */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Files</p>

          {/* Audio */}
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-2 block">Audio File (MP3) *</label>
            <input ref={audioRef} type="file" accept="audio/mpeg,.mp3" onChange={handleAudioChange} className="hidden" />
            <button
              type="button" onClick={() => audioRef.current?.click()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed text-sm transition-colors ${
                audioFile
                  ? 'border-green-500/30 bg-green-500/5 text-green-400'
                  : 'border-white/[0.1] text-[#9CA3AF] hover:border-white/20 hover:text-white'
              }`}
            >
              {audioFile ? (
                <>
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{audioFile.name}</span>
                  <span className="ml-auto text-xs flex-shrink-0">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</span>
                </>
              ) : (
                <><Music className="w-4 h-4 flex-shrink-0" /><span>Click to select MP3</span></>
              )}
            </button>
          </div>

          {/* Cover */}
          <div>
            <label className="text-xs text-[#9CA3AF] font-medium mb-2 block">Cover Image (JPG / PNG) *</label>
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
            <div className="flex items-center gap-3">
              <button
                type="button" onClick={() => coverRef.current?.click()}
                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed text-sm transition-colors ${
                  coverFile
                    ? 'border-green-500/30 bg-green-500/5 text-green-400'
                    : 'border-white/[0.1] text-[#9CA3AF] hover:border-white/20 hover:text-white'
                }`}
              >
                {coverFile ? (
                  <><Check className="w-4 h-4 flex-shrink-0" /><span className="truncate">{coverFile.name}</span></>
                ) : (
                  <><ImageIcon className="w-4 h-4 flex-shrink-0" /><span>Click to select cover image</span></>
                )}
              </button>
              {coverPreview && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        {uploading && progress && (
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <Loader2 className="w-4 h-4 animate-spin text-[#D40000]" />
            {progress}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit" disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
            : <><Upload className="w-4 h-4" /> Upload Song</>}
        </button>
      </form>
    </div>
  );
}
