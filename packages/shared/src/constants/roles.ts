export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
  SHIPPER: 'shipper',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
