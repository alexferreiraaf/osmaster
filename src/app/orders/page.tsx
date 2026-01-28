import { getOrders } from '@/lib/data';
import OrdersTable from '@/components/orders/orders-table';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
  };
}) {
  const query = searchParams?.q || '';
  const orders = await getOrders(query);

  return (
    <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
      <OrdersTable orders={orders} />
    </div>
  );
}
