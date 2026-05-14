import { cn } from '@/lib/utils';
import type { OrderStatus } from '@b2b/shared';

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  draft:          { label: 'Draft',           className: 'bg-gray-100 text-gray-600' },
  submitted:      { label: 'Submitted',       className: 'bg-blue-100 text-blue-700' },
  acknowledged:   { label: 'Acknowledged',    className: 'bg-indigo-100 text-indigo-700' },
  confirmed:      { label: 'Confirmed',       className: 'bg-violet-100 text-violet-700' },
  in_production:  { label: 'In Production',   className: 'bg-amber-100 text-amber-700' },
  ready_to_ship:  { label: 'Ready to Ship',   className: 'bg-orange-100 text-orange-700' },
  shipped:        { label: 'Shipped',         className: 'bg-cyan-100 text-cyan-700' },
  delivered:      { label: 'Delivered',       className: 'bg-green-100 text-green-700' },
  cancelled:      { label: 'Cancelled',       className: 'bg-red-100 text-red-600' },
};

export function POStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_STYLES[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
