import { NewOrderForm } from '@/components/orders/new-order-form';
import { getEmployees } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
  const employees = await getEmployees();
  
  return (
    <div className="bg-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border">
        <NewOrderForm employees={employees} />
    </div>
  );
}
