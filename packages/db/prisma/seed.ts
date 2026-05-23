import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const prismaDir = dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();
const PASSWORD = 'password123';
const SALT_ROUNDS = 10;

interface TamlongProduct {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  priceUsdCents: number;
  priceRangeMin: number;
  priceRangeMax: number;
  cbmPerUnit: number;
  originCountry: string;
  images: string[];
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@b2b.local' },
    update: {},
    create: {
      email: 'admin@b2b.local',
      passwordHash,
      role: 'admin',
      companyName: 'B2B Admin',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@b2b.local' },
    update: {},
    create: {
      email: 'seller@b2b.local',
      passwordHash,
      role: 'seller',
      companyName: 'Saigon Export Co.',
      companyAddress: '123 Nguyen Hue, Ho Chi Minh City, VN',
      taxId: 'VN-123456789',
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@b2b.local' },
    update: {},
    create: {
      email: 'buyer@b2b.local',
      passwordHash,
      role: 'buyer',
      companyName: 'US Import LLC',
      companyAddress: '456 Market St, San Francisco, CA',
    },
  });

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sellerId_sku: { sellerId: seller.id, sku: 'RICE-001' } },
      update: {},
      create: {
        sellerId: seller.id,
        sku: 'RICE-001',
        name: 'Premium Jasmine Rice 25kg',
        description: 'Export-grade jasmine rice, 25kg bags',
        category: 'Grains',
        unit: 'bag',
        priceUsdCents: 2800,
        priceRangeMin: 2500,
        priceRangeMax: 3200,
        cbmPerUnit: 0.035,
        weightKg: 25,
        hsCode: '1006.30',
        originCountry: 'VN',
        images: [],
      },
    }),
    prisma.product.upsert({
      where: { sellerId_sku: { sellerId: seller.id, sku: 'COFFEE-001' } },
      update: {},
      create: {
        sellerId: seller.id,
        sku: 'COFFEE-001',
        name: 'Robusta Coffee Beans 60kg',
        description: 'Grade 1 Robusta, screen 18',
        category: 'Coffee',
        unit: 'bag',
        priceUsdCents: 9500,
        priceRangeMin: 8500,
        priceRangeMax: 11000,
        cbmPerUnit: 0.09,
        weightKg: 60,
        hsCode: '0901.11',
        originCountry: 'VN',
        images: [],
      },
    }),
  ]);

  const existingPo = await prisma.purchaseOrder.findFirst({
    where: { buyerId: buyer.id, sellerId: seller.id },
  });

  if (!existingPo) {
    const poNumber = `PO-${new Date().getFullYear()}-SEED001`;
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        buyerId: buyer.id,
        sellerId: seller.id,
        status: 'draft',
        notes: 'Demo purchase order from seed',
        shippingTerms: 'FOB',
        portOfLoading: 'Ho Chi Minh City',
        portOfDischarge: 'Los Angeles',
        items: {
          create: products.map((p) => ({
            productId: p.id,
            quantity: 100,
            unitPriceCents: p.priceUsdCents,
            cbmSubtotal: Number(p.cbmPerUnit) * 100,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await prisma.pOVersion.create({
      data: {
        poId: po.id,
        versionNumber: 1,
        changedBy: buyer.id,
        changeReason: 'Initial draft',
        snapshot: po as unknown as object,
      },
    });
  }

  const tamlong = await prisma.user.upsert({
    where: { email: 'tamlongcraft@gmail.com' },
    update: {
      passwordHash,
      role: 'seller',
      companyName: 'Tam Long Craft',
      isActive: true,
    },
    create: {
      email: 'tamlongcraft@gmail.com',
      passwordHash,
      role: 'seller',
      companyName: 'Tam Long Craft',
      companyAddress: 'Vietnam',
      taxId: 'VN-TAMLONG',
    },
  });

  await prisma.user.upsert({
    where: { email: 'thewynliving@gmail.com' },
    update: {
      passwordHash,
      role: 'buyer',
      companyName: 'The Wyn Living',
      isActive: true,
    },
    create: {
      email: 'thewynliving@gmail.com',
      passwordHash,
      role: 'buyer',
      companyName: 'The Wyn Living',
      companyAddress: 'USA',
    },
  });

  const tamlongDataPath = join(prismaDir, '../data/tamlong-products.json');
  let tamlongImported = 0;
  let tamlongSkipped: string[] = [];

  try {
    const tamlongData = JSON.parse(readFileSync(tamlongDataPath, 'utf-8')) as {
      products: TamlongProduct[];
      skipped?: string[];
    };
    tamlongSkipped = tamlongData.skipped ?? [];

    for (const p of tamlongData.products) {
      await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: tamlong.id, sku: p.sku } },
        update: {
          name: p.name,
          description: p.description,
          category: p.category,
          unit: p.unit,
          priceUsdCents: p.priceUsdCents,
          priceRangeMin: p.priceRangeMin,
          priceRangeMax: p.priceRangeMax,
          cbmPerUnit: p.cbmPerUnit,
          originCountry: p.originCountry,
          isActive: true,
        },
        create: {
          sellerId: tamlong.id,
          sku: p.sku,
          name: p.name,
          description: p.description,
          category: p.category,
          unit: p.unit,
          priceUsdCents: p.priceUsdCents,
          priceRangeMin: p.priceRangeMin,
          priceRangeMax: p.priceRangeMax,
          cbmPerUnit: p.cbmPerUnit,
          originCountry: p.originCountry,
          images: p.images,
        },
      });
      tamlongImported++;
    }
  } catch (err) {
    console.warn('Tam Long product import skipped — run: node scripts/import-tamlong-products.mjs');
    console.warn(err);
  }

  console.log('Seed complete:');
  console.log(`  Admin:  admin@b2b.local / ${PASSWORD}`);
  console.log(`  Seller: seller@b2b.local / ${PASSWORD}`);
  console.log(`  Buyer:  buyer@b2b.local / ${PASSWORD}`);
  console.log(`  Tam Long Craft seller: tamlongcraft@gmail.com / ${PASSWORD} (${tamlongImported} products)`);
  console.log(`  The Wyn Living buyer: thewynliving@gmail.com / ${PASSWORD}`);
  if (tamlongSkipped.length) {
    console.log(`  Skipped ${tamlongSkipped.length} Excel rows (missing FOB/CBM): ${tamlongSkipped.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
