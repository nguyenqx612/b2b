export const LINK_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  BLOCKED: 'blocked',
} as const;

export type LinkStatus = (typeof LINK_STATUS)[keyof typeof LINK_STATUS];

export const LINK_SOURCE = {
  ADMIN: 'admin',
  VENDOR_INVITE: 'vendor_invite',
  BUYER_REQUEST: 'buyer_request',
} as const;

export type LinkSource = (typeof LINK_SOURCE)[keyof typeof LINK_SOURCE];
