'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Check, AlertCircle, Globe, Music2, Link } from 'lucide-react';

interface Settings {
  platform_name:     string;
  admin_email:       string;
  instagram_url:     string;
  youtube_url:       string;
  spotify_url:       string;
  twitter_url:       string;
  apple_music_url:   string;
  contact_enabled:   string;
  new_release_banner: string;
}

const DEFAULT: Settings = {
  platform_name:     'ESHANI',
  admin_email:       'eshani.admin01@gmail.com',
  instagram_url:     '',
  youtube_url:       '',
  spotify_url:       '',
  twitter_url:       '',
  apple_music_url:   '',
  contact_enabled:   'true',
  new_release_banner: 'false',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => setSettings({ ...DEFAULT, ...d.settings }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const toggle = (key: keyof Settings) =>
    set(key, settings[key] === 'true' ? 'false' : 'true');

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full bg-[#0f0f0f] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#D40000]/40 transition-colors';

  const Toggle = ({ k, label, sub }: { k: keyof Settings; label: string; sub: string }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        <p className="text-xs text-[#9CA3AF]">{sub}</p>
      </div>
      <button type="button" onClick={() => toggle(k)}
        className={`relative w-11 h-6 rounded-full transition-colors ${settings[k] === 'true' ? 'bg-[#D40000]' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[k] === 'true' ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>Settings</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Platform and account configuration.</p>
        </div>
        <div className="space-y-4">{[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-[#141414] border border-white/[0.06] rounded-2xl animate-pulse" />
        ))}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>Settings</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Platform and account configuration.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#b50000] disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 text-green-400 text-sm">
          <Check className="w-4 h-4" /> Settings saved successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-[#D40000]/10 border border-[#D40000]/20 rounded-xl px-4 py-2.5 text-[#D40000] text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Platform */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Platform</h2>
        <div>
          <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Platform Name</label>
          <input value={settings.platform_name} onChange={e => set('platform_name', e.target.value)} className={input} />
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 block">Admin Contact Email</label>
          <input type="email" value={settings.admin_email} onChange={e => set('admin_email', e.target.value)} className={input} />
          <p className="text-[10px] text-[#6B7280] mt-1">Contact form messages are sent here.</p>
        </div>
        <div className="pt-1 border-t border-white/[0.06] space-y-1">
          <Toggle k="contact_enabled"   label="Contact Form"     sub="Allow fans to send messages from the website" />
          <Toggle k="new_release_banner" label="New Release Banner" sub="Show a coming-soon banner on the homepage" />
        </div>
      </div>

      {/* Social links */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Social & Streaming Links</h2>
        {[
          { key: 'instagram_url',   label: 'Instagram',    icon: Link,   placeholder: 'https://instagram.com/eshanimusic' },
          { key: 'youtube_url',     label: 'YouTube',      icon: Link,   placeholder: 'https://youtube.com/@eshani' },
          { key: 'spotify_url',     label: 'Spotify',      icon: Music2, placeholder: 'https://open.spotify.com/artist/...' },
          { key: 'twitter_url',     label: 'X / Twitter',  icon: Link,   placeholder: 'https://x.com/eshanimusic' },
          { key: 'apple_music_url', label: 'Apple Music',  icon: Globe,  placeholder: 'https://music.apple.com/...' },
        ].map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-[#9CA3AF] font-medium mb-1.5 flex items-center gap-1.5 block">
              <Icon className="w-3.5 h-3.5" /> {label}
            </label>
            <input
              type="url" value={settings[key as keyof Settings]}
              onChange={e => set(key as keyof Settings, e.target.value)}
              placeholder={placeholder} className={input}
            />
          </div>
        ))}
      </div>

      {/* Email / Resend setup notice */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Email Setup</h2>
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Contact form emails use <strong className="text-white">Resend</strong>. To enable:
        </p>
        <ol className="text-xs text-[#9CA3AF] space-y-1 list-decimal list-inside">
          <li>Create a free account at <strong className="text-white">resend.com</strong></li>
          <li>Copy your API key and add <code className="text-[#D40000] bg-black/40 px-1 rounded">RESEND_API_KEY=re_...</code> to <code className="text-white">.env.local</code></li>
          <li>Verify <code className="text-white">eshani.admin01@gmail.com</code> as a recipient in Resend dashboard</li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}
