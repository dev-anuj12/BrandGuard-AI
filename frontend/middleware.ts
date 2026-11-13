import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/submit',
  '/approvals',
  '/review',
  '/settings',
  '/threats',
  '/protection',
  '/analytics',
  '/editor',
  '/brands',
  '/knowledge-base',
];

const AUTH_PAGES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('brandguard_token')?.value;

  // 1. Guard authenticated-only routes
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect logged-in users away from /login and /register
  const isAuthPage = AUTH_PAGES.includes(pathname);
  if (isAuthPage && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/submit',
    '/approvals/:path*',
    '/review/:path*',
    '/settings',
    '/settings/:path*',
    '/threats/:path*',
    '/protection/:path*',
    '/analytics',
    '/analytics/:path*',
    '/editor',
    '/editor/:path*',
    '/brands',
    '/brands/:path*',
    '/knowledge-base',
    '/knowledge-base/:path*',
    '/login',
    '/register',
  ],
};

