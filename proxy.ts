import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/discover(.*)',
  '/songs(.*)',
  '/albums(.*)',
  '/playlists(.*)',
  '/upcoming(.*)',
  '/library(.*)',
  '/eshani(.*)',
  '/artists(.*)',
  '/api/webhook(.*)',
  '/admin/login',
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Admin routes (except /admin/login): require a Clerk session.
  // Role enforcement (admin-only) is done server-side inside the dashboard layout.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
