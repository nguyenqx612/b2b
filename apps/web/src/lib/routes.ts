import type { Role } from '@b2b/shared';

/** Default landing page after login for each role. */
export const DASHBOARD_BY_ROLE: Record<Role, string> = {
  buyer: '/buyer/vendors',
  seller: '/seller/catalog',
  admin: '/admin/users',
  shipper: '/shipper/quotes',
};

export function dashboardForRole(role: Role | string | undefined | null): string {
  if (role && role in DASHBOARD_BY_ROLE) {
    return DASHBOARD_BY_ROLE[role as Role];
  }
  return '/auth/login';
}

export function vendorCatalogPath(slug: string) {
  return `/buyer/vendors/${slug}/catalog`;
}

export function vendorProductPath(slug: string, productId: string) {
  return `/buyer/vendors/${slug}/catalog/${productId}`;
}

export function vendorTeaserPath(slug: string) {
  return `/v/${slug}`;
}

export function isPublicPath(path: string): boolean {
  if (path === '/') return true;
  if (path.startsWith('/v/')) return true;
  if (path === '/auth/login' || path === '/auth/register') return true;
  return false;
}
