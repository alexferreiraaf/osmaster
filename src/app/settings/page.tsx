'use client';

import { useState, useEffect } from 'react';
import { getEmployees } from '@/lib/data';
import { SettingsForm } from '@/components/settings/settings-form';
import type { Employee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data.sort());
      setLoading(false);
    }
    fetchEmployees();
  }, []);

  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees((currentEmployees) => [...currentEmployees, newEmployee].sort());
  };

  const handleEmployeeDeleted = (deletedEmployee: Employee) => {
    setEmployees((currentEmployees) =>
      currentEmployees.filter((employee) => employee !== deletedEmployee)
    );
  };

  if (loading) {
      return (
          <div className="bg-card max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border space-y-8">
              <div>
                <Skeleton className="h-10 w-48 mb-4"/>
                <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>
                    <Skeleton className="h-10 w-24"/>
                </div>
              </div>
              <div>
                <Skeleton className="h-10 w-48 mb-4"/>
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full"/>
                    <Skeleton className="h-12 w-full"/>
                </div>
              </div>
          </div>
      );
  }

  return (
    <SettingsForm
      employees={employees}
      onEmployeeAdded={handleEmployeeAdded}
      onEmployeeDeleted={handleEmployeeDeleted}
    />
  );
}
