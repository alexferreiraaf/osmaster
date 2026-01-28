'use client';

import type { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    Concluída: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    'Em Andamento': 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
    Pendente: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100',
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        `px-2.5 py-1 text-xs font-bold rounded-full capitalize`,
        statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
        className
      )}
    >
      {status}
    </Badge>
  );
}
