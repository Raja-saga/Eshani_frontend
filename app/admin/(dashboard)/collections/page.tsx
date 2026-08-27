'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Trash2, Pencil, X, Check, Layers, Music2, Upload, ImageIcon } from 'lucide-react';

interface Collection {
  id: string; name: string; description: string; image_url: string; song_count: number;
}
interface Song { id: string; title: string; artist: string; image_url: string; duration: number; }

const inputCls = 'w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-white/[0.08] text-white text-sm placeholder:text-[#6B7280] focus:border-[#D40000] focus:outline-none transition-colors';
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImageUploading(true); setImageError('');
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const key = `covers/collection-${Date.now()}.${ext}`;
      const res = await fetch('/api/admin/upload-file', {
        method: 'POST',
        headers: { 'x-file-key': key, 'x-content-type': file.type },
        body: file,
      });
      if (!res.ok) throw new Error();
      const { publicUrl } = await res.json();
      setNewImage(publicUrl);
    } catch {
      setImageError('Upload failed. Try paste URL instead.');
    } finally {
      setImageUploading(false);
    }
  };

  // Edit collection
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImageMode, setEditImageMode] = useState<'upload' | 'url'>('upload');
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editImageError, setEditImageError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const openEdit = (col: Collection) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditDesc(col.description ?? '');
    setEditImage(col.image_url ?? '');
    setEditImageMode('upload');
    setEditImageError('');
  };

  const handleEditImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setEditImageUploading(true); setEditImageError('');
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const key = `covers/collection-${Date.now()}.${ext}`;
      const res = await fetch('/api/admin/upload-file', {
        method: 'POST',
        headers: { 'x-file-key': key, 'x-content-type': file.type },
        body: file,
      });
      if (!res.ok) throw new Error();
      const { publicUrl } = await res.json();
      setEditImage(publicUrl);
    } catch {
      setEditImageError('Upload failed. Try paste URL instead.');
    } finally {
      setEditImageUploading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingId || !editName.trim()) return;
    setEditSaving(true);
    try {
      await fetch(`/api/admin/collections/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc, imageUrl: editImage }),
      });
      setCollections(prev => prev.map(c =>
        c.id === editingId ? { ...c, name: editName, description: editDesc, image_url: editImage } : c
      ));
      setEditingId(null);
    } catch { setError('Failed to save changes'); }
    finally { setEditSaving(false); }
  };

  // Song management
  const [managingId, setManagingId] = useState<string | null>(null);
  const [colSongs, setColSongs] = useState<string[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/collections').then(r => r.json()),
      fetch('/api/songs?limit=200').then(r => r.json()),
    ]).then(([c, s]) => {
      setCollections(c.collections ?? []);
      setAllSongs(s.songs ?? []);
    }).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, imageUrl: newImage }),
      });
      const { collection } = await res.json();
      setCollections(prev => [...prev, { ...collection, song_count: 0 }]);
      setNewName(''); setNewDesc(''); setNewImage(''); setImageError(''); setImageMode('upload'); setShowCreate(false);
    } catch { setError('Failed to create collection'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Songs will not be deleted.')) return;
    await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const openManage = async (col: Collection) => {
    setManagingId(col.id);
    setLoadingSongs(true);
    setSongSearch('');
    try {
      const res = await fetch(`/api/collections/${col.id}`);
      const data = await res.json();
      setColSongs((data.songs ?? []).map((s: Song) => s.id));
    } catch { setColSongs([]); }
    finally { setLoadingSongs(false); }
  };

  const toggleSong = async (songId: string) => {
    const has = colSongs.includes(songId);
    if (has) {
      await fetch(`/api/admin/collections/${managingId}/songs`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      });
      setColSongs(prev => prev.filter(s => s !== songId));
      setCollections(prev => prev.map(c => c.id === managingId ? { ...c, song_count: c.song_count - 1 } : c));
    } else {
      await fetch(`/api/admin/collections/${managingId}/songs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      });
      setColSongs(prev => [...prev, songId]);
      setCollections(prev => prev.map(c => c.id === managingId ? { ...c, song_count: c.song_count + 1 } : c));
    }
  };

  const managingCol = collections.find(c => c.id === managingId);
  const filteredSongs = allSongs.filter(s =>
    !songSearch || s.title.toLowerCase().includes(songSearch.toLowerCase()) || s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>Collections</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Manage curated song collections</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors"
        >
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {error && <div className="bg-[#D40000]/10 border border-[#D40000]/20 rounded-xl px-4 py-3 text-[#D40000] text-sm">{error}</div>}

      {/* Create form */}
      {showCreate && (
        <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-5 space-y-4">
          <p className="text-white font-semibold">New Collection</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Name *</label>
              <input className={inputCls} placeholder="Collection name" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Description</label>
              <input className={inputCls} placeholder="Short description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
          </div>
          {/* Cover image — upload or URL */}
          <div className="space-y-2">
            <label className="text-xs text-[#9CA3AF] block">Cover Image</label>

            {/* Preview */}
            {newImage ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0f0f0f]">
                <Image src={newImage} alt="preview" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setNewImage('')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border border-dashed border-white/[0.12] bg-[#0f0f0f] flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-[#333]" />
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex rounded-lg bg-[#0f0f0f] border border-white/[0.08] p-0.5 gap-0.5 w-fit">
              {(['upload', 'url'] as const).map(m => (
                <button key={m} type="button" onClick={() => setImageMode(m)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${imageMode === m ? 'bg-[#D40000] text-white' : 'text-[#9CA3AF] hover:text-white'}`}>
                  {m === 'upload' ? 'Upload File' : 'Paste URL'}
                </button>
              ))}
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/[0.15] text-sm text-[#9CA3AF] hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
                >
                  {imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {imageUploading ? 'Uploading...' : 'Choose image from computer'}
                </button>
                {imageError && <p className="text-xs text-[#D40000] mt-1">{imageError}</p>}
              </div>
            ) : (
              <input
                className={inputCls}
                placeholder="https://..."
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
              />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); setNewImage(''); setImageError(''); setImageMode('upload'); }} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !newName.trim()} className="flex-1 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {/* Collections list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#D40000]" /></div>
      ) : collections.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 text-center">
          <Layers className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-white font-semibold">No collections yet</p>
          <p className="text-[#9CA3AF] text-sm mt-1">Create your first collection above.</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          {collections.map((col) => (
            <div key={col.id} className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0f0f0f]">
                {col.image_url ? (
                  <Image src={col.image_url} alt={col.name} fill className="object-cover" sizes="48px" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><Layers className="w-5 h-5 text-[#333]" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{col.name}</p>
                <p className="text-[#9CA3AF] text-xs mt-0.5">{col.song_count} songs · {col.description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openManage(col)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white text-xs hover:bg-white/[0.1] transition-colors"
                >
                  <Music2 className="w-3.5 h-3.5" /> Manage Songs
                </button>
                <button
                  onClick={() => openEdit(col)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Edit collection"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(col.id)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#D40000] hover:bg-[#D40000]/10 transition-all"
                  title="Delete collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit collection modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={e => { if (e.target === e.currentTarget) setEditingId(null); }}>
          <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Edit Collection</p>
              <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"><X className="w-4 h-4" /></button>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Name *</label>
              <input className={inputCls} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Collection name" />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1.5 block">Description</label>
              <input className={inputCls} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Short description" />
            </div>

            {/* Cover image */}
            <div className="space-y-2">
              <label className="text-xs text-[#9CA3AF] block">Cover Image</label>

              {editImage ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0f0f0f]">
                  <Image src={editImage} alt="preview" fill className="object-cover" unoptimized />
                  <button type="button" onClick={() => setEditImage('')}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-white/[0.12] bg-[#0f0f0f] flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[#333]" />
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex rounded-lg bg-[#0f0f0f] border border-white/[0.08] p-0.5 gap-0.5 w-fit">
                {(['upload', 'url'] as const).map(m => (
                  <button key={m} type="button" onClick={() => setEditImageMode(m)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${editImageMode === m ? 'bg-[#D40000] text-white' : 'text-[#9CA3AF] hover:text-white'}`}>
                    {m === 'upload' ? 'Upload File' : 'Paste URL'}
                  </button>
                ))}
              </div>

              {editImageMode === 'upload' ? (
                <div>
                  <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageFile} />
                  <button type="button" onClick={() => editFileRef.current?.click()} disabled={editImageUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/[0.15] text-sm text-[#9CA3AF] hover:text-white hover:border-white/30 transition-colors disabled:opacity-50">
                    {editImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {editImageUploading ? 'Uploading...' : 'Choose image from computer'}
                  </button>
                  {editImageError && <p className="text-xs text-[#D40000] mt-1">{editImageError}</p>}
                </div>
              ) : (
                <input className={inputCls} placeholder="https://..." value={editImage} onChange={e => setEditImage(e.target.value)} />
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editSaving || !editName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Song management modal */}
      {managingId && managingCol && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setManagingId(null); }}>
          <div className="bg-[#141414] border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg space-y-4 my-8">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Songs in "{managingCol.name}"</p>
              <button onClick={() => setManagingId(null)} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"><X className="w-4 h-4" /></button>
            </div>
            <input
              className={inputCls}
              placeholder="Search songs…"
              value={songSearch}
              onChange={e => setSongSearch(e.target.value)}
            />
            {loadingSongs ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#D40000]" /></div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1">
                {filteredSongs.map(song => {
                  const included = colSongs.includes(song.id);
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
