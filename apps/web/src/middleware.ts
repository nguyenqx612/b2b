import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];

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

  // Allow unauthenticated users to access public paths
  if (!isLoggedIn && PUBLIC_PATHS.includes(path)) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from home and auth pages to their dashboard
  if (isLoggedIn && PUBLIC_PATHS.includes(path)) {
    const dashboardPath = userRole === 'seller' ? '/seller'
                         : userRole === 'admin' ? '/admin'
                         : '/buyer';
    // Use relative redirect to preserve the original hostname (localhost vs b2b-web-1)
    return NextResponse.redirect(dashboardPath, { status: 307 });
  }

  // Redirect unauthenticated users trying to access protected routes to login
  if (!isLoggedIn && !PUBLIC_PATHS.includes(path)) {
    const loginUrl = new URL('/auth/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', path);
    // Use relative redirect to preserve the original hostname
    return NextResponse.redirect(loginUrl.pathname + loginUrl.search, { status: 307 });
  }

  // Logged-in users can access everything else - no redirects
  // Role-based access control should be handled at the page/component level
  return NextResponse.next();
});

export const config = {
  // Run on every request except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
