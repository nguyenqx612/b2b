import type { OrderStatus } from '../constants/order-status.js';

export interface POItemProduct {
  name: string;
  sku: string;
  cbmPerUnit?: number;
}

export interface POItem {
  id: string;
  productId: string;
  product: POItemProduct;
  quantity: number;
  unitPriceCents: number;
  cbmSubtotal: number;
}

export interface PurchaseOrderParticipant {
  id: string;
  email: string;
  companyName: string | null;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  buyerId: string;
  sellerId: string;
  buyer?: PurchaseOrderParticipant;
  seller?: PurchaseOrderParticipant;
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
  changedByUser?: { email: string; companyName: string | null };
  changeReason: string | null;
  snapshot: PurchaseOrder;
  createdAt: string;
}
