import type { Role } from '@b2b/shared';

export const PUBLIC_CATALOG = '/catalog';

/** Default landing page after login for each role. */
export const DASHBOARD_BY_ROLE: Record<Role, string> = {
  buyer: '/buyer/orders',
  seller: '/seller/catalog',
  admin: '/admin/users',
};

export function dashboardForRole(role: Role | string | undefined | null): string {
  if (role && role in DASHBOARD_BY_ROLE) {
    return DASHBOARD_BY_ROLE[role as Role];
  }
  return '/auth/login';
}

export function isPublicPath(path: string): boolean {
  if (path === '/' || path === PUBLIC_CATALOG) return true;
  if (path.startsWith(`${PUBLIC_CATALOG}/`)) return true;
  if (path === '/auth/login' || path === '/auth/register') return true;
  return false;
}
