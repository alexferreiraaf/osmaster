'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getOrderById, getEmployees } from '@/lib/data';
import { EditOrderForm } from '@/components/orders/edit-order-form';
import type { Order, Employee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditOrderPage() {
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
          <div className="bg-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border space-y-8">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-24 w-full" />
          </div>
      );
  }
  
  if (!order) {
    notFound();
  }

  return (
    <div className="bg-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border">
        <EditOrderForm employees={employees} order={order} />
    </div>
  );
}
