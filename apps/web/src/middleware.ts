import { auth } from '@/lib/auth';
import { dashboardForRole, isPublicPath, PUBLIC_CATALOG } from '@/lib/routes';
import { NextResponse } from 'next/server';

function isPublicAsset(path: string) {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/favicon') ||
    path.includes('.')
  );
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  if (isPublicAsset(path)) return NextResponse.next();

  if (path.startsWith('/api/image-proxy')) return NextResponse.next();

  if (path === '/buyer/catalog' || path.startsWith('/buyer/catalog/')) {
    const target = path.replace('/buyer/catalog', PUBLIC_CATALOG) || PUBLIC_CATALOG;
    return NextResponse.redirect(new URL(target, nextUrl.origin));
  }

  const session = req.auth;
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  function redirectToDashboard() {
    if (isLoggedIn && !userRole) {
      return NextResponse.redirect(
        new URL('/api/auth/signout?callbackUrl=/auth/login', nextUrl.origin),
      );
    }
    return NextResponse.redirect(new URL(dashboardForRole(userRole), nextUrl.origin));
  }

  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
