import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { prisma } from '@b2b/db';
import type { DocType } from '@b2b/db';
import { s3Service } from './s3.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'pdf', 'templates');

async function renderPDF(templateName: string, data: Record<string, unknown>): Promise<Buffer> {
  let html = await fs.readFile(path.join(TEMPLATES_DIR, `${templateName}.html`), 'utf-8');

  // Simple token replacement: {{key}}
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, String(value ?? ''));
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

const TEMPLATE_MAP: Record<DocType, string> = {
  commercial_invoice: 'commercial-invoice',
  packing_list: 'packing-list',
  co_form_b: 'co-form-b',
  phytosanitary: 'phytosanitary',
  bill_of_lading: 'bill-of-lading',
  proforma_invoice: 'proforma-invoice',
  us_import_declaration: 'us-import-declaration',
};

export async function generateDocument(poId: string, docType: DocType, generatedBy: string) {
  const po = await prisma.purchaseOrder.findUniqueOrThrow({
    where: { id: poId },
    include: {
      buyer: { select: { email: true, companyName: true, companyAddress: true, taxId: true } },
      seller: { select: { email: true, companyName: true, companyAddress: true, taxId: true } },
      items: { include: { product: { select: { name: true, sku: true, hsCode: true, originCountry: true, cbmPerUnit: true } } } },
    },
  });

  const templateData: Record<string, unknown> = {
    poNumber: po.poNumber,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    buyerCompany: po.buyer.companyName ?? po.buyer.email,
    buyerAddress: po.buyer.companyAddress ?? '',
    buyerTaxId: po.buyer.taxId ?? '',
    sellerCompany: po.seller.companyName ?? po.seller.email,
    sellerAddress: po.seller.companyAddress ?? '',
    sellerTaxId: po.seller.taxId ?? '',
    portOfLoading: po.portOfLoading ?? 'Ho Chi Minh City, Vietnam',
    portOfDischarge: po.portOfDischarge ?? 'Los Angeles, USA',
    shippingTerms: po.shippingTerms ?? 'FOB',
    itemRows: po.items
      .map(
        (item) =>
          `<tr><td>${item.product.name}</td><td>${item.product.sku}</td><td>${item.product.hsCode ?? ''}</td><td>${item.quantity}</td></tr>`,
      )
      .join(''),
  };

  const pdfBuffer = await renderPDF(TEMPLATE_MAP[docType], templateData);
  const key = await s3Service.uploadFile({
    buffer: pdfBuffer,
    mimetype: 'application/pdf',
    folder: `documents/${poId}`,
    filename: `${docType}-${Date.now()}`,
  });

  return prisma.exportDocument.create({
    data: {
      poId,
      docType,
      pdfS3Key: key,
      generatedBy,
      documentData: templateData as any,
    },
  });
}
