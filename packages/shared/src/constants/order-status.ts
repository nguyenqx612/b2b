export const ORDER_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ACKNOWLEDGED: 'acknowledged',
  CONFIRMED: 'confirmed',
  IN_PRODUCTION: 'in_production',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type TransitionRole = 'buyer' | 'seller' | 'admin';

// Valid transitions: key → allowed next states
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['acknowledged', 'cancelled'],
  acknowledged: ['confirmed', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

const ROLE_TRANSITIONS: Record<Exclude<TransitionRole, 'admin'>, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  buyer: {
    draft: ['submitted', 'cancelled'],
    submitted: ['cancelled'],
    acknowledged: ['cancelled'],
    confirmed: ['cancelled'],
    in_production: ['cancelled'],
  },
  seller: {
    submitted: ['acknowledged', 'cancelled'],
    acknowledged: ['confirmed', 'cancelled'],
    confirmed: ['in_production', 'cancelled'],
    in_production: ['ready_to_ship', 'cancelled'],
    ready_to_ship: ['shipped'],
    shipped: ['delivered'],
  },
};

export function canTransition(role: TransitionRole, from: OrderStatus, to: OrderStatus): boolean {
  if (!isValidTransition(from, to)) return false;
  if (role === 'admin') return true;
  return ROLE_TRANSITIONS[role][from]?.includes(to) ?? false;
}
