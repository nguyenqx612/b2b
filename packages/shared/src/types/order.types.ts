import type { OrderStatus } from '../constants/order-status.js';

export interface POItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceCents: number;
  cbmSubtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  currentVersion: number;
  notes: string | null;
  shippingTerms: string | null;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  items: POItem[];
  createdAt: string;
  updatedAt: string;
}

export interface POVersion {
  id: string;
  poId: string;
  versionNumber: number;
  changedBy: string;
  changeReason: string | null;
  snapshot: PurchaseOrder;
  createdAt: string;
}
