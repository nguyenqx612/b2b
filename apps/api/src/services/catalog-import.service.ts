import * as cheerio from 'cheerio';
import { prisma } from '@b2b/db';
import * as vendorRepo from '../repositories/vendor.repository.js';

interface ScrapedProduct {
  sku: string;
  name: string;
  description?: string;
  category: string;
  images: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'product';
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'HarborLane-CatalogBot/1.0' },
  });
  if (!res.ok) throw Object.assign(new Error(`Failed to fetch ${url}: ${res.status}`), { status: 422 });
  return res.text();
}

async function parseTamLongCraft(baseUrl: string): Promise<ScrapedProduct[]> {
  const html = await fetchHtml(baseUrl);
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];
  const seen = new Set<string>();

  $('a[href*="/san-pham"], a[href*="/product"], .product, article').each((_, el) => {
    const link = $(el).attr('href') ?? $(el).find('a').first().attr('href');
    const name = $(el).find('h2, h3, .product-title, .title').first().text().trim()
      || $(el).text().trim().split('\n')[0]?.trim();
    if (!name || name.length < 3) return;

    const img = $(el).find('img').first().attr('src') ?? '';
    const category = $(el).closest('[data-category]').attr('data-category')
      || $(el).find('.category').first().text().trim()
      || 'General';

    const sku = slugify(name);
    if (seen.has(sku)) return;
    seen.add(sku);

    products.push({
      sku,
      name: name.slice(0, 300),
      category: category.slice(0, 100) || 'General',
      description: $(el).find('p').first().text().trim().slice(0, 500) || undefined,
      images: img ? [img.startsWith('http') ? img : new URL(img, baseUrl).href] : [],
    });
  });

  if (products.length === 0) {
    $('h2, h3').each((_, el) => {
      const name = $(el).text().trim();
      if (!name || name.length < 4 || name.length > 200) return;
      const sku = slugify(name);
      if (seen.has(sku)) return;
      seen.add(sku);
      products.push({ sku, name, category: 'General', images: [] });
    });
  }

  return products.slice(0, 200);
}

async function parseGenericSite(baseUrl: string): Promise<ScrapedProduct[]> {
  const html = await fetchHtml(baseUrl);
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];
  const seen = new Set<string>();

  $('a').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    const text = $(el).text().trim();
    if (!text || text.length < 4 || text.length > 200) return;
    if (!/product|san-pham|item|catalog|shop/i.test(href) && !$(el).closest('.product').length) return;

    const sku = slugify(text);
    if (seen.has(sku)) return;
    seen.add(sku);

    const img = $(el).find('img').attr('src') ?? $(el).closest('article, .product').find('img').first().attr('src') ?? '';
    products.push({
      sku,
      name: text.slice(0, 300),
      category: 'Imported',
      images: img ? [img.startsWith('http') ? img : new URL(img, baseUrl).href] : [],
    });
  });

  return products.slice(0, 100);
}

export async function importFromUrl(sellerId: string, url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  let scraped: ScrapedProduct[];

  if (hostname.includes('tamlongcraft.com')) {
    scraped = await parseTamLongCraft(url);
  } else {
    scraped = await parseGenericSite(url);
  }

  if (scraped.length === 0) {
    throw Object.assign(new Error('No products found at the provided URL'), { status: 422 });
  }

  let imported = 0;
  let updated = 0;

  for (const p of scraped) {
    const existing = await prisma.product.findUnique({
      where: { sellerId_sku: { sellerId, sku: p.sku } },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          description: p.description,
          category: p.category,
          ...(p.images.length ? { images: p.images } : {}),
        },
      });
      updated++;
    } else {
      await prisma.product.create({
        data: {
          sellerId,
          sku: p.sku,
          name: p.name,
          description: p.description,
          category: p.category,
          unit: 'pcs',
          priceUsdCents: 0,
          priceRangeMin: 0,
          priceRangeMax: 0,
          cbmPerUnit: 0,
          images: p.images,
          isActive: false,
        },
      });
      imported++;
    }
  }

  await vendorRepo.upsertForSeller(sellerId, {
    slug: (await vendorRepo.findBySellerId(sellerId))?.slug ?? slugify(hostname),
    displayName: (await vendorRepo.findBySellerId(sellerId))?.displayName ?? hostname,
    catalogSourceUrl: url,
    catalogLastImportedAt: new Date(),
    teaserCategories: (await vendorRepo.findBySellerId(sellerId))?.teaserCategories as string[] ?? [],
  });

  return { imported, updated, total: scraped.length };
}

export async function bulkSetActive(sellerId: string, productIds: string[], isActive: boolean) {
  const result = await prisma.product.updateMany({
    where: { id: { in: productIds }, sellerId },
    data: { isActive },
  });
  return { count: result.count };
}
