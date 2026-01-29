'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getOrderById, getEmployees } from '@/lib/data';
import OrderDetails from '@/components/orders/order-details';
import type { Order, Employee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const id = params.id as string;
      const [orderData, employeesData] = await Promise.all([
        getOrderById(id),
        getEmployees(),
      ]);
      
      setOrder(orderData);
      setEmployees(employeesData);
      setLoading(false);
    }

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[700px] w-full" />
            <div className="flex gap-4">
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }
  
  if (!order) {
    notFound();
  }

  return <OrderDetails order={order} employees={employees} />;
}
