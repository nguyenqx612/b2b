import { prisma } from '@b2b/db';
import type { Prisma } from '@b2b/db';

// Buyer-safe select — price_usd_cents is NEVER included
const BUYER_SELECT = {
  id: true,
  sellerId: true,
  seller: { select: { companyName: true } },
  sku: true,
  name: true,
  description: true,
  category: true,
  unit: true,
  priceRangeMin: true,
  priceRangeMax: true,
  cbmPerUnit: true,
  hsCode: true,
  originCountry: true,
  images: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

// Full select for sellers (includes priceUsdCents)
const SELLER_SELECT = {
  ...BUYER_SELECT,
  priceUsdCents: true,
  weightKg: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export async function findAllForBuyer(options: {
  category?: string;
  search?: string;
  sellerId?: string;
  allowedSellerIds?: string[];
  page: number;
  pageSize: number;
}) {
  const { category, search, sellerId, allowedSellerIds, page, pageSize } = options;

  if (allowedSellerIds !== undefined) {
    if (allowedSellerIds.length === 0) {
      return { items: [], total: 0, page, pageSize };
    }
    if (sellerId && !allowedSellerIds.includes(sellerId)) {
      return { items: [], total: 0, page, pageSize };
    }
  }

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(sellerId ? { sellerId } : {}),
    ...(allowedSellerIds && !sellerId ? { sellerId: { in: allowedSellerIds } } : {}),
    ...(allowedSellerIds && sellerId ? { sellerId } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: BUYER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function findActiveCategories(sellerId?: string, allowedSellerIds?: string[]) {
  if (allowedSellerIds !== undefined && allowedSellerIds.length === 0) {
    return [];
  }

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(sellerId ? { sellerId } : {}),
      ...(allowedSellerIds && !sellerId ? { sellerId: { in: allowedSellerIds } } : {}),
    },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  return rows.map((row) => row.category);
}

export async function findByIdForBuyer(id: string, allowedSellerIds?: string[]) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      ...(allowedSellerIds ? { sellerId: { in: allowedSellerIds } } : {}),
    },
    select: BUYER_SELECT,
  });
  return product;
}

export async function findAllForSeller(sellerId: string, options: {
  category?: string;
  search?: string;
  page: number;
  pageSize: number;
  listing?: 'all' | 'listed' | 'hidden';
}) {
  const { category, search, page, pageSize, listing } = options;
  const where: Prisma.ProductWhereInput = {
    sellerId,
    ...(listing === 'listed' ? { isActive: true } : {}),
    ...(listing === 'hidden' ? { isActive: false } : {}),
    ...(category ? { category } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }] } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: SELLER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function findByIdForSeller(id: string, sellerId: string) {
  return prisma.product.findFirst({
    where: { id, sellerId },
    select: SELLER_SELECT,
  });
}

export async function create(sellerId: string, data: Prisma.ProductCreateWithoutSellerInput) {
  return prisma.product.create({
    data: { ...data, sellerId },
    select: SELLER_SELECT,
  });
}

export async function update(id: string, sellerId: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.updateMany({
    where: { id, sellerId },
    data,
  });
}

export async function softDelete(id: string, sellerId: string) {
  return prisma.product.updateMany({
    where: { id, sellerId },
    data: { isActive: false },
  });
}
