'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Trash2, X, Check, ListMusic, Music2, Pencil, Upload, ImageIcon } from 'lucide-react';

interface Playlist {
  id: string; title: string; description: string; image_url: string; mood: string; song_count: number;
}
interface Song { id: string; title: string; artist: string; image_url: string; duration: number; }

const inputCls = 'w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-white/[0.08] text-white text-sm placeholder:text-[#6B7280] focus:border-[#D40000] focus:outline-none transition-colors';
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

async function uploadToR2(file: File, key: string): Promise<string> {
  const res = await fetch('/api/admin/upload-file', {
    method: 'POST',
    headers: { 'x-file-key': key, 'x-content-type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error('Upload failed');
  const { publicUrl } = await res.json();
  return publicUrl;
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newMood, setNewMood] = useState('');
  const [newImageMode, setNewImageMode] = useState<'upload' | 'url'>('upload');
  const [newImageUploading, setNewImageUploading] = useState(false);
  const [newImageError, setNewImageError] = useState('');
  const newFileRef = useRef<HTMLInputElement>(null);

  // Manage songs modal
  const [managingId, setManagingId] = useState<string | null>(null);
  const [plSongs, setPlSongs] = useState<string[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  // Edit modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImageMode, setEditImageMode] = useState<'upload' | 'url'>('upload');
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editImageError, setEditImageError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/playlists').then(r => r.json()),
      fetch('/api/songs?limit=200').then(r => r.json()),
    ]).then(([p, s]) => {
      setPlaylists(p.playlists ?? []);
      setAllSongs(s.songs ?? []);
    }).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, []);

  // Create form image upload
  const handleNewImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNewImageUploading(true); setNewImageError('');
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const key = `covers/playlist-new-${Date.now()}.${ext}`;
      const url = await uploadToR2(file, key);
      setNewImage(url);
    } catch { setNewImageError('Upload failed. Try paste URL instead.'); }
    finally { setNewImageUploading(false); }
  };

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
      setNewTitle(''); setNewDesc(''); setNewImage(''); setNewMood('');
      setNewImageMode('upload'); setNewImageError('');
      setShowCreate(false);
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

  const openEdit = (pl: Playlist) => {
    setEditingId(pl.id);
    setEditTitle(pl.title);
    setEditDesc(pl.description ?? '');
    setEditMood(pl.mood ?? '');
    setEditImage(pl.image_url ?? '');
    setEditImageMode('upload');
    setEditImageError('');
  };

  const handleEditImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEditImageUploading(true); setEditImageError('');
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const key = `covers/playlist-${editingId}-${Date.now()}.${ext}`;
      const url = await uploadToR2(file, key);
      setEditImage(url);
    } catch { setEditImageError('Upload failed. Try paste URL instead.'); }
    finally { setEditImageUploading(false); }
  };

  const handleEditSave = async () => {
    if (!editingId || !editTitle.trim()) return;
    setEditSaving(true);
    try {
      await fetch(`/api/admin/playlists/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle, description: editDesc,
          imageUrl: editImage, mood: editMood,
        }),
      });
      setPlaylists(prev => prev.map(p => p.id === editingId
        ? { ...p, title: editTitle, description: editDesc, image_url: editImage, mood: editMood }
        : p
      ));
      setEditingId(null);
    } catch { setEditImageError('Failed to save.'); }
    finally { setEditSaving(false); }
  };

  const managingPl = playlists.find(p => p.id === managingId);
  const editingPl = playlists.find(p => p.id === editingId);
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

      {/* Create form */}
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

          {/* Cover image with upload/URL modes */}
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1.5 block">Cover Image</label>
            {newImage && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-2 bg-[#0f0f0f]">
                <Image src={newImage} alt="Preview" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setNewImage('')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}
            <div className="flex rounded-lg bg-[#0f0f0f] border border-white/[0.08] p-0.5 gap-0.5 mb-2">
              {(['upload', 'url'] as const).map(m => (
                <button key={m} type="button" onClick={() => setNewImageMode(m)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${newImageMode === m ? 'bg-[#D40000] text-white' : 'text-[#9CA3AF] hover:text-white'}`}>
                  {m === 'upload' ? 'Upload File' : 'Paste URL'}
                </button>
              ))}
            </div>
            {newImageMode === 'upload' ? (
              <>
                <input ref={newFileRef} type="file" accept="image/*" className="hidden" onChange={handleNewImageFile} />
                <button type="button" onClick={() => newFileRef.current?.click()} disabled={newImageUploading}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/[0.15] text-sm text-[#9CA3AF] hover:text-white hover:border-white/30 transition-colors disabled:opacity-50">
                  {newImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {newImageUploading ? 'Uploading…' : 'Choose image'}
                </button>
              </>
            ) : (
              <input className={inputCls} placeholder="https://..." value={newImage} onChange={e => setNewImage(e.target.value)} />
            )}
            {newImageError && <p className="text-xs text-[#D40000] mt-1">{newImageError}</p>}
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setShowCreate(false); setNewTitle(''); setNewDesc(''); setNewImage(''); setNewMood(''); }} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors">Cancel</button>
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
                  onClick={() => openEdit(pl)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Edit playlist"
                >
                  <Pencil className="w-3.5 h-3.5" />
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

      {/* Manage Songs Modal */}
      {managingId && managingPl && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setManagingId(null); }}>
          <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg space-y-4 my-8">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Songs in &quot;{managingPl.title}&quot;</p>
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

      {/* Edit Playlist Modal */}
      {editingId && editingPl && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setEditingId(null); }}>
          <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg space-y-5 my-8">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Edit Playlist</p>
              <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1.5 block">Title *</label>
                <input className={inputCls} value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Playlist title" />
              </div>
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1.5 block">Mood / Vibe</label>
                <input className={inputCls} value={editMood} onChange={e => setEditMood(e.target.value)} placeholder="e.g. Energetic, Moody…" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Description</label>
              <input className={inputCls} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Short description" />
            </div>

            {/* Cover image */}
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Cover Image</label>

              {/* Preview */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#0f0f0f] border border-white/[0.08] flex items-center justify-center mb-3">
                {editImage ? (
                  <>
                    <Image src={editImage} alt="Cover preview" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setEditImage('')}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#4B5563]">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">No image set</span>
                  </div>
                )}
              </div>

              {/* Mode tabs */}
              <div className="flex rounded-lg bg-[#0f0f0f] border border-white/[0.08] p-0.5 gap-0.5 mb-2">
                {(['upload', 'url'] as const).map(m => (
                  <button key={m} type="button" onClick={() => setEditImageMode(m)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${editImageMode === m ? 'bg-[#D40000] text-white' : 'text-[#9CA3AF] hover:text-white'}`}>
                    {m === 'upload' ? 'Upload File' : 'Paste URL'}
                  </button>
                ))}
              </div>

              {editImageMode === 'upload' ? (
                <>
                  <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageFile} />
                  <button type="button" onClick={() => editFileRef.current?.click()} disabled={editImageUploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.15] text-sm text-[#9CA3AF] hover:text-white hover:border-white/30 transition-colors disabled:opacity-50">
                    {editImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {editImageUploading ? 'Uploading…' : 'Choose image'}
                  </button>
                </>
              ) : (
                <input className={inputCls} placeholder="https://..." value={editImage} onChange={e => setEditImage(e.target.value)} />
              )}
              {editImageError && <p className="text-xs text-[#D40000] mt-1">{editImageError}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditingId(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editSaving || !editTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
