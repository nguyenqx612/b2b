// Buyer-safe product view — never includes priceUsdCents
export interface ProductBuyerView {
  id: string;
  sellerId: string;
  sellerCompany: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  priceRangeMin: number; // cents
  priceRangeMax: number; // cents
  cbmPerUnit: number;
  hsCode: string | null;
  originCountry: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

// Full product view for sellers
export interface ProductSellerView extends ProductBuyerView {
  priceUsdCents: number; // cents — seller only
  weightKg: number | null;
}
