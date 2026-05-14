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
  page: number;
  pageSize: number;
}) {
  const { category, search, page, pageSize } = options;
  const where: Prisma.ProductWhereInput = {
    isActive: true,
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

export async function findAllForSeller(sellerId: string, options: {
  category?: string;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const { category, search, page, pageSize } = options;
  const where: Prisma.ProductWhereInput = {
    sellerId,
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

export async function findByIdForBuyer(id: string) {
  return prisma.product.findFirst({
    where: { id, isActive: true },
    select: BUYER_SELECT,
  });
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
