'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const fetchedOrders = await getOrders(query);
    setOrders(fetchedOrders);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderDeleted = (deletedOrderId: string) => {
    fetchOrders();
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
