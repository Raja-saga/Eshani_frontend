'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Radio, Plus, Pencil, Trash2, X, Upload, Calendar, Music } from 'lucide-react';
import Image from 'next/image';

interface UpcomingRelease {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  release_date: string | null;
  genre: string | null;
  pre_orders: number;
  created_at: string;
}

interface FormState {
  title: string;
  artist: string;
  imageUrl: string;
  releaseDate: string;
  genre: string;
}

const EMPTY_FORM: FormState = { title: '', artist: 'ESHANI', imageUrl: '', releaseDate: '', genre: '' };

function formatDate(d: string | null) {
  if (!d) return 'TBA';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
}

function ReleaseModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<FormState> & { id?: string };
  onSave: (id: string | undefined, data: FormState) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    title: initial.title ?? '',
    artist: initial.artist ?? 'ESHANI',
    imageUrl: initial.imageUrl ?? '',
    releaseDate: initial.releaseDate ?? '',
    genre: initial.genre ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const presignRes = await fetch('/api/admin/upload-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, folder: 'covers' }),
      });
      if (!presignRes.ok) throw new Error('Presign failed');
      const { uploadUrl, publicUrl } = await presignRes.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setForm(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch {
      setError('Image upload failed. Paste a URL instead.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(initial.id, form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
            {initial.id ? 'Edit Release' : 'Schedule Release'}
          </h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cover Image */}
          <div className="flex items-start gap-4">
            <div
              className="w-24 h-24 rounded-xl bg-[#141414] border border-white/[0.08] flex-shrink-0 relative overflow-hidden cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {form.imageUrl ? (
                <Image src={form.imageUrl} alt="cover" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-[#9CA3AF]" />
                  <span className="text-[10px] text-[#9CA3AF]">Upload</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
            />
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1.5 font-medium">Cover Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={set('imageUrl')}
                  placeholder="https://… or click thumbnail to upload"
                  className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1.5 font-medium">Title *</label>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="Song or album title"
              required
              className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50"
            />
          </div>

          {/* Artist & Genre row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1.5 font-medium">Artist</label>
              <input
                value={form.artist}
                onChange={set('artist')}
                placeholder="ESHANI"
                className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1.5 font-medium">Genre</label>
              <input
                value={form.genre}
                onChange={set('genre')}
                placeholder="e.g. R&B"
                className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D40000]/50"
              />
            </div>
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1.5 font-medium">Release Date</label>
            <input
              type="date"
              value={form.releaseDate}
              onChange={set('releaseDate')}
              className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D40000]/50 [color-scheme:dark]"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm font-medium hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#B00000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : initial.id ? 'Save Changes' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminReleasesPage() {
  const [releases, setReleases] = useState<UpcomingRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing?: UpcomingRelease }>({ open: false });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/upcoming');
      if (res.ok) {
        const data = await res.json();
        setReleases(data.releases ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(id: string | undefined, form: FormState) {
    if (id) {
      const res = await fetch(`/api/admin/upcoming/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          artist: form.artist,
          imageUrl: form.imageUrl,
          releaseDate: form.releaseDate || null,
          genre: form.genre,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
    } else {
      const res = await fetch('/api/admin/upcoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          artist: form.artist,
          imageUrl: form.imageUrl,
          releaseDate: form.releaseDate || undefined,
          genre: form.genre,
        }),
      });
      if (!res.ok) throw new Error('Create failed');
    }
    await load();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/upcoming/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setReleases(prev => prev.filter(r => r.id !== id));
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
            Scheduled Releases
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Manage upcoming releases — these appear on the homepage when &quot;New Release Banner&quot; is enabled in Settings.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#B00000] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Release
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : releases.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Radio className="w-10 h-10 text-[#9CA3AF]" aria-hidden="true" />
          <p className="text-white font-semibold">No scheduled releases</p>
          <p className="text-[#9CA3AF] text-sm max-w-xs">
            Plan drop dates and coordinate releases from here. Enable &quot;New Release Banner&quot; in Settings to show them on the homepage.
          </p>
          <button
            onClick={() => setModal({ open: true })}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#B00000] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first release
          </button>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#9CA3AF] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-medium">Release</th>
                <th className="text-left px-5 py-3.5 font-medium hidden sm:table-cell">Artist</th>
                <th className="text-left px-5 py-3.5 font-medium hidden md:table-cell">Genre</th>
                <th className="text-left px-5 py-3.5 font-medium">Drop Date</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {releases.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === releases.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                        {r.image_url ? (
                          <Image src={r.image_url} alt={r.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-[#9CA3AF]" />
                          </div>
                        )}
                      </div>
                      <span className="text-white font-medium line-clamp-1">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#9CA3AF] hidden sm:table-cell">{r.artist}</td>
                  <td className="px-5 py-4 text-[#9CA3AF] hidden md:table-cell">{r.genre || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D40000] flex-shrink-0" />
                      <span className="text-[#D40000] font-medium text-xs">{formatDate(r.release_date)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, editing: r })}
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal.open && (
        <ReleaseModal
          initial={modal.editing ? {
            id: modal.editing.id,
            title: modal.editing.title,
            artist: modal.editing.artist,
            imageUrl: modal.editing.image_url,
            releaseDate: modal.editing.release_date ?? '',
            genre: modal.editing.genre ?? '',
          } : EMPTY_FORM}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
            <div>
              <p className="text-white font-semibold">Delete this release?</p>
              <p className="text-[#9CA3AF] text-sm mt-1">This will remove it from the upcoming section immediately.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9CA3AF] text-sm font-medium hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
