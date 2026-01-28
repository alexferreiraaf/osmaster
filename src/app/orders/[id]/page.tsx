import { notFound, redirect } from 'next/navigation';
import { getOrderById, getEmployees } from '@/lib/data';
import OrderDetails from '@/components/orders/order-details';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  const employees = await getEmployees();
  
  if (!order) {
    notFound();
  }

  return <OrderDetails order={order} employees={employees} />;
}
