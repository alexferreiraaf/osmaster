'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrders } from '@/lib/data';
import OrdersTable from '@/components/orders/orders-table';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const fetchedOrders = await getOrders(query);
      setOrders(fetchedOrders);
      setLoading(false);
    }
    fetchOrders();
  }, [query]);

  const handleOrderDeleted = (deletedOrderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== deletedOrderId)
    );
  };

  if (loading) {
    return (
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden p-4 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
      <OrdersTable orders={orders} onOrderDeleted={handleOrderDeleted} />
    </div>
  );
}
