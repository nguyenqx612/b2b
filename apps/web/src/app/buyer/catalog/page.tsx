import { redirect } from 'next/navigation';
import { PUBLIC_CATALOG } from '@/lib/routes';

export default function BuyerCatalogRedirect() {
  redirect(PUBLIC_CATALOG);
}
