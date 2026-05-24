import * as repo from '../repositories/product.repository.js';
import * as vendorService from './vendor.service.js';
import { s3Service } from './s3.service.js';
import type { CreateProductInput, UpdateProductInput } from '@b2b/shared';
import { ROLES } from '@b2b/shared';

export async function listForBuyer(
  buyerId: string,
  role: string,
  query: { category?: string; search?: string; sellerId?: string; page?: number; pageSize?: number },
) {
  const allowedSellerIds =
    role === ROLES.ADMIN ? undefined : await vendorService.getApprovedSellerIds(buyerId);

  if (query.sellerId && role !== ROLES.ADMIN) {
    await vendorService.assertBuyerCanAccessSeller(buyerId, query.sellerId);
  }

  return repo.findAllForBuyer({
    category: query.category,
    search: query.search,
    sellerId: query.sellerId,
    allowedSellerIds,
    page: query.page ?? 1,
    pageSize: Math.min(query.pageSize ?? 20, 100),
  });
}

export async function listForSeller(sellerId: string, query: {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  listing?: 'all' | 'listed' | 'hidden';
}) {
  return repo.findAllForSeller(sellerId, {
    category: query.category,
    search: query.search,
    page: query.page ?? 1,
    pageSize: Math.min(query.pageSize ?? 20, 100),
    listing: query.listing,
  });
}

export async function getForBuyer(id: string, buyerId: string, role: string) {
  const allowedSellerIds =
    role === ROLES.ADMIN ? undefined : await vendorService.getApprovedSellerIds(buyerId);

  const product = await repo.findByIdForBuyer(id, allowedSellerIds);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  return product;
}

export async function listCategories(buyerId: string, role: string, sellerId?: string) {
  const allowedSellerIds =
    role === ROLES.ADMIN ? undefined : await vendorService.getApprovedSellerIds(buyerId);

  if (sellerId && role !== ROLES.ADMIN) {
    await vendorService.assertBuyerCanAccessSeller(buyerId, sellerId);
  }

  return repo.findActiveCategories(sellerId, allowedSellerIds);
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

const PRODUCT_IMAGE_KEY = /^products\/([0-9a-f-]{36})\//i;

export async function getAuthenticatedImageUrl(key: string, userId: string, role: string) {
  if (key.startsWith('/') || key.includes('..') || key.includes('\\')) {
    throw Object.assign(new Error('Invalid image key'), { status: 400 });
  }

  const match = PRODUCT_IMAGE_KEY.exec(key);
  if (!match) {
    throw Object.assign(new Error('Invalid image key'), { status: 400 });
  }

  const productId = match[1];
  const product = await repo.findByIdForBuyer(productId);
  if (!product) {
    throw Object.assign(new Error('Product not found'), { status: 404 });
  }

  if (!product.images.includes(key)) {
    throw Object.assign(new Error('Image not found for product'), { status: 404 });
  }

  if (role === ROLES.SELLER) {
    const own = await repo.findByIdForSeller(productId, userId);
    if (!own) {
      throw Object.assign(new Error('Access denied'), { status: 403 });
    }
  } else if (role === ROLES.BUYER) {
    await vendorService.assertBuyerCanAccessSeller(userId, product.sellerId);
  } else if (role !== ROLES.ADMIN) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  return s3Service.getSignedUrl(key);
}
