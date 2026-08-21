import React from 'react';
import Link from 'next/link';
import { Music2 } from 'lucide-react';

const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/>
  </svg>
);
const YtIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.1 5 12 5 12 5s-4.1 0-6.9.1c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.9.8 2.3.8C6.7 19 12 19 12 19s4.1 0 6.9-.1c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.7V9.3l5.6 2.7-5.6 2.7z"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.631 5.906-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.073 9.404-.866 13.115 1.338a.936.936 0 01-.954 1.608z"/>
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'Music',    href: '/songs' },
  { label: 'Albums',   href: '/albums' },
  { label: 'Discover', href: '/discover' },
  { label: 'About',    href: '/eshani' },
];

const SOCIAL = [
  { label: 'Instagram', Icon: IgIcon, href: 'https://instagram.com/eshaniofficial' },
  { label: 'YouTube',   Icon: YtIcon, href: 'https://youtube.com/@eshani' },
  { label: 'X',         Icon: XIcon,  href: 'https://x.com/eshanimusic' },
];

const STREAMING = [
  { label: 'Spotify',     Icon: SpotifyIcon, href: 'https://open.spotify.com' },
  { label: 'Apple Music', Icon: AppleIcon,   href: 'https://music.apple.com' },
  { label: 'YouTube',     Icon: YtIcon,       href: 'https://youtube.com/@eshani' },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.06]" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8 lg:pt-16">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-16">

          {/* Brand */}
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D40000] flex items-center justify-center" aria-hidden>
                  <Music2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins,sans-serif)' }}>
                  ESH<span className="text-[#D40000]">ANI</span>
                </span>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Every track, every release —<br />direct to you.
              </p>
            </div>

            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIAL.map(({ label, Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#6B7280] hover:text-[#D40000] hover:border-[#D40000]/20 transition-all">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-white uppercase tracking-widest">Explore</p>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href}
                  className="text-sm text-[#6B7280] hover:text-white transition-colors w-fit">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Listen on */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-white uppercase tracking-widest">Listen On</p>
            <div className="flex flex-col gap-2.5">
              {STREAMING.map(({ label, Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[#6B7280] hover:text-white transition-colors w-fit group">
                  <span className="p-1.5 rounded-md bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
                    <Icon />
                  </span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#4B5563]">
          <p>© {new Date().getFullYear()} ESHANI. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-[#9CA3AF] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#9CA3AF] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
