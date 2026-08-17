import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PremiumNavbar, AudioPlayer, BottomNavigation } from '@/components';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ESHANI - Premium Music Streaming Platform',
  description:
    'Experience premium music streaming with ESHANI. Discover millions of songs, curated playlists, and exclusive content.',
  keywords: ['music', 'streaming', 'playlists', 'artists', 'premium'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#000000] text-[#FFFFFF]`}
      >
        {/* Premium Navigation */}
        <PremiumNavbar />

        {/* Main Content - with top padding for fixed navbar */}
        <main className="pt-16 lg:pt-20 min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </main>

        {/* Persistent Audio Player */}
        <AudioPlayer />

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
