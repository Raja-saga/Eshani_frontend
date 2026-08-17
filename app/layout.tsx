import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { PremiumNavbar, AudioPlayer, BottomNavigation } from '@/components';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'ESHANI — Premium Music Streaming for Independent Artists',
  description:
    'Discover, stream, and connect with independent artists. ESHANI is the premium music platform built for creators and fans.',
  keywords: ['music', 'streaming', 'independent artists', 'playlists', 'premium', 'eshani'],
  authors: [{ name: 'ESHANI' }],
  openGraph: {
    title: 'ESHANI — Premium Music Streaming',
    description: 'Stream millions of tracks. Support independent artists. ESHANI.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESHANI — Premium Music Streaming',
    description: 'Stream millions of tracks. Support independent artists.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${poppins.variable} antialiased bg-[#000000] text-[#FFFFFF]`}
        >
          {/* Premium Navigation */}
          <PremiumNavbar />

          {/* Main Content */}
          <main className="min-h-screen flex flex-col">
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
    </ClerkProvider>
  );
}