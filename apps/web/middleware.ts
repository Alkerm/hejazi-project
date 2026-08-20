import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_HINT = 'cosmetics_sid_hint';

// Admin-only routes — unauthenticated → /login
const adminPrefixes = ['/admin'];

// Soft-launch: these routes redirect to /interest for unauthenticated users
const softLockedPrefixes = [
  '/register',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/orders',
  '/profile',
  '/wishlist',
  '/cart',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_HINT)?.value);

  // Admin protection → /login
  const isAdmin = adminPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isAdmin && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Soft-launch protection → /interest
  const isSoftLocked = softLockedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isSoftLocked && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/interest';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/register',
    '/login',
    '/forgot-password',
    '/reset-password/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/wishlist',
    '/cart',
    '/cart/:path*',
  ],
};
