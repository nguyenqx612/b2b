import type { ProductBuyerView } from '@b2b/shared';
import { apiClient } from '@/lib/api-client';

export async function fetchPublicProducts(params: {
  category?: string;
  search?: string;
  sellerId?: string;
  page?: string;
  pageSize?: string;
}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.sellerId) qs.set('sellerId', params.sellerId);
  if (params.page) qs.set('page', params.page);
  if (params.pageSize) qs.set('pageSize', params.pageSize);

  const query = qs.toString();
  return apiClient.get<{
    items: ProductBuyerView[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/api/public/products${query ? `?${query}` : ''}`);
}

export async function fetchPublicCategories() {
  return apiClient.get<{ categories: string[] }>('/api/public/products/categories');
}

export async function fetchPublicProduct(id: string) {
  return apiClient.get<ProductBuyerView>(`/api/public/products/${id}`);
}
