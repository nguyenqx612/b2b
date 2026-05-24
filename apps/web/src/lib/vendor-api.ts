import type { BuyerVendorSummary, BuyerVendorRequestSummary, VendorTeaserView, VendorProfileView, ProductBuyerView, VendorListItem } from '@b2b/shared';
import { apiClient } from '@/lib/api-client';

export async function fetchPublishedVendors() {
  return apiClient.get<{ items: VendorListItem[] }>('/api/vendors');
}

export async function fetchVendorTeaser(slug: string) {
  return apiClient.get<VendorTeaserView>(`/api/vendors/${slug}/teaser`);
}

export async function fetchMyVendors(token: string) {
  return apiClient.get<{ items: BuyerVendorSummary[]; pending: BuyerVendorRequestSummary[] }>(
    '/api/vendor-links/my-vendors',
    token,
  );
}

export async function fetchVendorProfile(token: string) {
  return apiClient.get<VendorProfileView | null>('/api/vendor-links/profile', token);
}

export async function updateVendorProfile(token: string, body: unknown) {
  return apiClient.patch<VendorProfileView>('/api/vendor-links/profile', body, token);
}

export async function requestVendorAccess(token: string, body: { slug?: string; sellerId?: string }) {
  return apiClient.post('/api/vendor-links/request', body, token);
}

export async function fetchSellerBuyers(token: string) {
  return apiClient.get<{ items: unknown[] }>('/api/vendor-links/seller', token);
}

export async function inviteBuyer(token: string, email: string) {
  return apiClient.post('/api/vendor-links/invite', { email }, token);
}

export async function updateVendorLinkStatus(token: string, id: string, status: string) {
  return apiClient.patch(`/api/vendor-links/${id}`, { status }, token);
}

export async function fetchAdminVendorLinks(token: string, page = 1) {
  return apiClient.get<{ items: unknown[]; total: number }>(`/api/admin/vendor-links?page=${page}`, token);
}

export async function createAdminVendorLink(
  token: string,
  body: { buyerId: string; sellerId: string; status?: string },
) {
  return apiClient.post('/api/admin/vendor-links', body, token);
}

export async function fetchBuyerProducts(
  token: string,
  params: { sellerId: string; category?: string; search?: string; page?: string; pageSize?: string },
) {
  const qs = new URLSearchParams();
  qs.set('sellerId', params.sellerId);
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', params.page);
  if (params.pageSize) qs.set('pageSize', params.pageSize);
  return apiClient.get<{ items: unknown[]; total: number; page: number; pageSize: number }>(
    `/api/products?${qs.toString()}`,
    token,
  );
}

export async function fetchBuyerProductCategories(token: string, sellerId: string) {
  return apiClient.get<{ categories: string[] }>(`/api/products/categories?sellerId=${sellerId}`, token);
}

export async function fetchBuyerProduct(token: string, id: string) {
  return apiClient.get<ProductBuyerView>(`/api/products/${id}`, token);
}

export async function fetchVendorLinkStatus(token: string, slug: string) {
  return apiClient.get<{ link: { status: string } | null }>(`/api/vendor-links/status/${slug}`, token);
}

export async function importCatalogFromUrl(token: string, url?: string) {
  return apiClient.post<{ imported: number; updated: number; total: number }>(
    '/api/products/import-from-url',
    url ? { url } : {},
    token,
  );
}

export async function bulkSetProductActive(token: string, productIds: string[], isActive: boolean) {
  return apiClient.patch<{ count: number }>('/api/products/bulk-active', { productIds, isActive }, token);
}
