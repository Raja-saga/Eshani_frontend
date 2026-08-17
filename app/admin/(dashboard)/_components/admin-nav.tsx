'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Music,
  Upload,
  Disc,
  Radio,
  BarChart2,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Songs', href: '/admin/songs', icon: Music },
  { label: 'Upload', href: '/admin/upload', icon: Upload },
  { label: 'Albums', href: '/admin/albums', icon: Disc },
  { label: 'Releases', href: '/admin/releases', icon: Radio },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Profile', href: '/admin/profile', icon: User },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06] flex-shrink-0">
        <Link
          href="/admin"
          className="text-2xl font-black tracking-tight text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          ESH<span className="text-[#D40000]">ANI</span>
        </Link>
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D40000] mt-0.5">
          Admin
        </p>
      </div>

      {/* Nav items — scrollable */}
      <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#D40000]/15 text-white border border-[#D40000]/25'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-[#D40000]' : 'text-current'}`}
                  aria-hidden="true"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Sign out — always pinned at bottom */}
      <div className="flex-shrink-0 px-3 pb-6 border-t border-white/[0.06] pt-4">
        <SignOutButton redirectUrl="/">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-[#ff4444] hover:bg-[#D40000]/10 transition-all duration-150">
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" aria-hidden="true" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </nav>
  );
}
