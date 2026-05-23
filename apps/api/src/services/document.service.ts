import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma, Prisma } from '@b2b/db';
import type { DocType } from '@b2b/db';
import { s3Service } from './s3.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'pdf', 'templates');

type GeneratedDocumentPo = Prisma.PurchaseOrderGetPayload<{
  include: {
    buyer: { select: { email: true; companyName: true; companyAddress: true; taxId: true } };
    seller: { select: { email: true; companyName: true; companyAddress: true; taxId: true } };
    items: { include: { product: { select: { name: true; sku: true; hsCode: true; originCountry: true; cbmPerUnit: true } } } };
  };
}>;

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function renderPDF(templateName: string, data: Record<string, unknown>): Promise<Buffer> {
  let html = await fs.readFile(path.join(TEMPLATES_DIR, `${templateName}.html`), 'utf-8');

  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, String(value ?? ''));
  }

  const { withBrowserPage } = await import('./browser-pool.js');
  return withBrowserPage(async (page) => {
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return Buffer.from(pdfBuffer);
  });
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

async function generatePiNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const latest = await tx.proformaInvoice.findFirst({
    where: { piNumber: { startsWith: `PI-${year}-` } },
    orderBy: { piNumber: 'desc' },
    select: { piNumber: true },
  });
  const latestSequence = Number(latest?.piNumber.split('-').at(-1) ?? 0);
  return `PI-${year}-${String(latestSequence + 1).padStart(4, '0')}`;
}

async function createDocumentRecord(
  po: GeneratedDocumentPo,
  docType: DocType,
  generatedBy: string,
  key: string,
  templateData: Record<string, unknown>,
) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const doc = await tx.exportDocument.create({
          data: {
            poId: po.id,
            docType,
            pdfS3Key: key,
            generatedBy,
            documentData: templateData as any,
          },
        });

        if (docType === 'proforma_invoice') {
          const subtotalCents = po.items.reduce(
            (total, item) => total + item.quantity * item.unitPriceCents,
            0,
          );
          const validityDays = 30;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + validityDays);

          await tx.proformaInvoice.create({
            data: {
              piNumber: await generatePiNumber(tx),
              poId: po.id,
              buyerId: po.buyerId,
              sellerId: po.sellerId,
              subtotalCents,
              shippingCents: 0,
              taxCents: 0,
              totalCents: subtotalCents,
              paymentTerms: 'Due on receipt',
              validityDays,
              expiresAt,
              pdfS3Key: key,
            },
          });
        }

        return doc;
      });
    } catch (err) {
      if (
        attempt < maxAttempts &&
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        continue;
      }
      throw err;
    }
  }

  throw Object.assign(new Error('Unable to generate proforma invoice number'), { status: 409 });
}

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
    poNumber: escapeHtml(po.poNumber),
    date: escapeHtml(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
    buyerCompany: escapeHtml(po.buyer.companyName ?? po.buyer.email),
    buyerAddress: escapeHtml(po.buyer.companyAddress ?? ''),
    buyerTaxId: escapeHtml(po.buyer.taxId ?? ''),
    sellerCompany: escapeHtml(po.seller.companyName ?? po.seller.email),
    sellerAddress: escapeHtml(po.seller.companyAddress ?? ''),
    sellerTaxId: escapeHtml(po.seller.taxId ?? ''),
    portOfLoading: escapeHtml(po.portOfLoading ?? 'Ho Chi Minh City, Vietnam'),
    portOfDischarge: escapeHtml(po.portOfDischarge ?? 'Los Angeles, USA'),
    shippingTerms: escapeHtml(po.shippingTerms ?? 'FOB'),
    itemRows: po.items
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.product.name)}</td><td>${escapeHtml(item.product.sku)}</td><td>${escapeHtml(item.product.hsCode ?? '')}</td><td>${escapeHtml(item.quantity)}</td></tr>`,
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

  try {
    return await createDocumentRecord(po, docType, generatedBy, key, templateData);
  } catch (err) {
    await s3Service.deleteFile(key).catch((cleanupErr) => {
      console.error('Failed to clean up generated PDF after DB error', cleanupErr);
    });
    throw err;
  }
}
