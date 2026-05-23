/**
 * Parse Tam Long Craft product spreadsheet → packages/db/data/tamlong-products.json
 * Run: node scripts/import-tamlong-products.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsxPath = join(__dirname, '../data/final-product-list.xlsx');
const outPath = join(__dirname, '../data/tamlong-products.json');

function buildName(sku, note, pkgNote, itemDim) {
  const parts = [sku];
  if (note) parts.push(String(note).trim());
  else if (pkgNote) parts.push(String(pkgNote).trim());
  const name = parts.join(' — ');
  return name.slice(0, 300);
}

function buildDescription(note, pkgNote, itemDim) {
  const lines = [];
  if (note) lines.push(String(note).trim());
  if (pkgNote) lines.push(String(pkgNote).trim());
  if (itemDim) lines.push(`Dimensions: ${String(itemDim).trim()}`);
  return lines.join('\n').slice(0, 5000) || undefined;
}

const wb = XLSX.read(readFileSync(xlsxPath), { type: 'buffer', cellDates: false });
const ws = wb.Sheets['Research'] ?? wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

const products = [];
const skipped = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const sku = row[1];
  if (!sku) continue;

  const note = row[3];
  const itemDim = row[4];
  const pkgNote = row[5];
  const cbmCarton = row[11];
  const itemsPerCarton = row[13] ?? 1;
  const unitCost = row[16];
  const retailLow = row[18];
  const retailHigh = row[22];

  if (unitCost == null || cbmCarton == null) {
    skipped.push(String(sku));
    continue;
  }

  const perCarton = Number(itemsPerCarton) || 1;
  const cbmPerUnit = Number(cbmCarton) / perCarton;
  const fobCents = Math.round(Number(unitCost) * 100);
  const rangeMin = Math.round(Number(unitCost) * 100);
  const rangeMax = Math.round(Number(retailHigh ?? retailLow ?? unitCost) * 100);

  products.push({
    sku: String(sku).trim(),
    name: buildName(sku, note, pkgNote, itemDim),
    description: buildDescription(note, pkgNote, itemDim),
    category: 'Furniture & Craft',
    unit: 'pcs',
    priceUsdCents: fobCents,
    priceRangeMin: Math.min(rangeMin, rangeMax),
    priceRangeMax: Math.max(rangeMin, rangeMax),
    cbmPerUnit: Number(cbmPerUnit.toFixed(4)),
    originCountry: 'VN',
    images: [],
  });
}

writeFileSync(outPath, JSON.stringify({ products, skipped }, null, 2));
console.log(`Wrote ${products.length} products to ${outPath}`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length} rows (missing FOB/CBM): ${skipped.join(', ')}`);
}
