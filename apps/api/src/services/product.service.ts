import * as repo from '../repositories/product.repository.js';
import { s3Service } from './s3.service.js';
import type { CreateProductInput, UpdateProductInput } from '@b2b/shared';

export async function listForBuyer(query: { category?: string; search?: string; page?: number; pageSize?: number }) {
  return repo.findAllForBuyer({
    category: query.category,
    search: query.search,
    page: query.page ?? 1,
    pageSize: Math.min(query.pageSize ?? 20, 100),
  });
}

export async function listForSeller(sellerId: string, query: { category?: string; search?: string; page?: number; pageSize?: number }) {
  return repo.findAllForSeller(sellerId, {
    category: query.category,
    search: query.search,
    page: query.page ?? 1,
    pageSize: Math.min(query.pageSize ?? 20, 100),
  });
}

export async function getForBuyer(id: string) {
  const product = await repo.findByIdForBuyer(id);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  return product;
}

export async function listCategories() {
  return repo.findActiveCategories();
}

export async function getForSeller(id: string, sellerId: string) {
  const product = await repo.findByIdForSeller(id, sellerId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  return product;
}

export async function create(sellerId: string, input: CreateProductInput) {
  return repo.create(sellerId, {
    sku: input.sku,
    name: input.name,
    description: input.description,
    category: input.category,
    unit: input.unit,
    priceUsdCents: input.priceUsdCents,
    priceRangeMin: input.priceRangeMin,
    priceRangeMax: input.priceRangeMax,
    cbmPerUnit: input.cbmPerUnit,
    weightKg: input.weightKg,
    hsCode: input.hsCode,
    originCountry: input.originCountry,
    images: [],
  });
}

export async function update(id: string, sellerId: string, input: UpdateProductInput) {
  const count = await repo.update(id, sellerId, input);
  if (count.count === 0) throw Object.assign(new Error('Product not found'), { status: 404 });
}

export async function addImage(id: string, sellerId: string, file: Express.Multer.File) {
  const product = await repo.findByIdForSeller(id, sellerId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });

  const key = await s3Service.uploadFile({
    buffer: file.buffer,
    mimetype: file.mimetype,
    folder: `products/${id}`,
  });

  await repo.update(id, sellerId, { images: { push: key } });
  return { key, url: await s3Service.getSignedUrl(key) };
}

export async function remove(id: string, sellerId: string) {
  await repo.softDelete(id, sellerId);
}
