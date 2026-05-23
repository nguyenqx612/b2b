import { redirect } from 'next/navigation';
import { DASHBOARD_BY_ROLE } from '@/lib/routes';

export default function BuyerPage() {
  redirect(DASHBOARD_BY_ROLE.buyer);
}
