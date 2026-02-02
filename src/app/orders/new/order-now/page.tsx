'use client';

import { useState, useEffect } from 'react';
import { OrderNowForm } from '@/components/orders/order-now-form';
import { getEmployees } from '@/lib/data';
import type { Employee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderNowPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      async function fetchEmployees() {
          setLoading(true);
          const employeesData = await getEmployees();
          setEmployees(employeesData);
          setLoading(false);
      }
      fetchEmployees();
  }, []);

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

  return (
    <div className="bg-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border">
        <OrderNowForm employees={employees} />
    </div>
  );
}
