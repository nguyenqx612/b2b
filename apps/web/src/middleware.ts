import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];
const DASHBOARD_BY_ROLE: Record<string, string> = {
  buyer: '/buyer',
  seller: '/seller',
  admin: '/admin',
};

// Paths that are fully public (static assets, NextAuth API, Next.js internals)
function isPublicAsset(path: string) {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/api/auth/') ||   // NextAuth handlers
    path.startsWith('/favicon') ||
    path.includes('.')                 // static files (.png, .css, etc.)
  );
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // Always pass through assets and NextAuth's own API routes
  if (isPublicAsset(path)) return NextResponse.next();

  const session = req.auth;
  const isLoggedIn = !!session;
  const userRole = (session?.user as any)?.role;

  function redirectToDashboard() {
    return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[userRole] ?? '/buyer', nextUrl.origin));
  }

  // Allow unauthenticated users to access public paths
  if (!isLoggedIn && PUBLIC_PATHS.includes(path)) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from home and auth pages to their dashboard
  if (isLoggedIn && PUBLIC_PATHS.includes(path)) {
    // Create absolute URL using the request origin to preserve original hostname
    return redirectToDashboard();
  }

  // Redirect unauthenticated users trying to access protected routes to login
  if (!isLoggedIn && !PUBLIC_PATHS.includes(path)) {
    const loginUrl = new URL('/auth/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith('/admin') && userRole !== 'admin') {
    return redirectToDashboard();
  }

  if (path.startsWith('/seller') && userRole !== 'seller' && userRole !== 'admin') {
    return redirectToDashboard();
  }

  if (path.startsWith('/buyer') && userRole !== 'buyer' && userRole !== 'admin') {
    return redirectToDashboard();
  }

  return NextResponse.next();
});

export const config = {
  // Run on every request except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
