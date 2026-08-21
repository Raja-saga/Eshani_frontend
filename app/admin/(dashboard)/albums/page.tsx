'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Disc, Plus, Trash2, Loader2, Music } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  image_url: string;
  release_date: string | null;
  description: string | null;
  track_count: number;
  total_duration: number | null;
}

const fmtDuration = (secs: number | null) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  return `${m} min`;
};

export default function AdminAlbumsPage() {
  const [albums, setAlbums]     = useState<Album[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const fetchAlbums = () => {
    setLoading(true);
    fetch('/api/albums')
      .then(r => r.json())
      .then(d => setAlbums(d.albums ?? []))
      .catch(() => setError('Failed to load albums'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlbums(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete album "${title}"? The songs inside will remain in the catalog but the album grouping will be removed.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/albums/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setAlbums(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete album. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>
            Albums
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {loading ? 'Loading…' : `${albums.length} album${albums.length !== 1 ? 's' : ''} in catalog`}
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
        <div className="bg-[#D40000]/10 border border-[#D40000]/20 rounded-2xl px-4 py-3 text-[#D40000] text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D40000]" />
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
          <Disc className="w-10 h-10 text-[#9CA3AF]" />
          <p className="text-white font-semibold">No albums yet</p>
          <p className="text-[#9CA3AF] text-sm">Create your first album by uploading a song and selecting "New Album + Song".</p>
          <Link href="/admin/upload?mode=new-album" className="mt-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] transition-colors">
            Create Album
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(album => (
            <div key={album.id} className="group bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
              {/* Cover */}
              <div className="relative aspect-square bg-[#0f0f0f]">
                <Image src={album.image_url} alt={album.title} fill className="object-cover" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                {/* Delete overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(album.id, album.title)}
                    disabled={deleting === album.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#D40000] text-white text-xs font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors"
                  >
                    {deleting === album.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                    Delete Album
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <p className="text-white font-semibold truncate">{album.title}</p>
                {album.description && (
                  <p className="text-[#9CA3AF] text-xs line-clamp-2">{album.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" /> {album.track_count} track{album.track_count !== 1 ? 's' : ''}
                  </span>
                  <span>{fmtDuration(album.total_duration)}</span>
                  {album.release_date && (
                    <span className="ml-auto">{new Date(album.release_date).getFullYear()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
