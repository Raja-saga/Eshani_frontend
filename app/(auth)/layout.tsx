/**
 * Auth Layout
 * 
 * Dark, premium layout for sign-in and sign-up pages.
 * Split-screen: left panel is brand/artwork, right panel is Clerk form.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000000] flex">
      {/* ── LEFT PANEL — Brand ───────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[42%] relative overflow-hidden">
        {/* Background artwork */}
        <Image
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=1200&fit=crop&q=80"
          alt="Music atmosphere"
          fill
          className="object-cover opacity-50"
          priority
          sizes="42vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-[#D40000]/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            ESH<span className="text-[#D40000]">ANI</span>
          </Link>

          {/* Quote */}
          <div className="mt-auto space-y-4">
            <div className="h-1 w-12 bg-[#D40000] rounded-full" />
            <blockquote className="text-2xl font-semibold text-white leading-tight max-w-xs">
              Music Without<br />
              <span className="text-[#D40000]">Limits.</span>
            </blockquote>
            <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-xs">
              Join 10,000+ independent artists and millions of fans on the platform built for creators.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Clerk Form ─────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#000000]">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden mb-10 text-2xl font-black tracking-tight text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          ESH<span className="text-[#D40000]">ANI</span>
        </Link>

        {/* Clerk component will render here */}
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
