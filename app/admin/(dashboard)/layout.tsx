import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import AdminNav from './_components/admin-nav';

function AccessDenied() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center space-y-4 px-6 max-w-sm">
        <div className="flex justify-center">
          <ShieldX className="w-16 h-16 text-[#D40000]" aria-hidden="true" />
        </div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          Access Denied
        </h1>
        <p className="text-[#9CA3AF] text-sm leading-relaxed">
          This area is restricted to ESHANI administrators. Your account does not have the
          required permissions.
        </p>
        <div className="flex flex-col gap-2 mt-2">
          <SignOutButton redirectUrl="/admin/login">
            <button className="w-full px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#D40000] text-white hover:bg-[#8B1111] transition-colors">
              Sign Out &amp; Try Another Account
            </button>
          </SignOutButton>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 text-sm font-medium rounded-xl border border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20 transition-colors"
          >
            Back to ESHANI
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  // Proxy already redirects unauthenticated users; this is a defensive fallback.
  if (!userId) {
    redirect('/admin/login');
  }

  if (sessionClaims?.metadata?.role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    // Fixed full-viewport overlay so the admin UI is isolated from the listener shell.
    <div className="fixed inset-0 z-50 flex bg-[#0a0a0a] overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 bg-[#0f0f0f] border-r border-white/[0.06] flex flex-col">
        <AdminNav />
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8">{children}</div>
      </main>
    </div>
  );
}
