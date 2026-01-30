'use client';

import type { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        `px-2.5 py-1 text-xs font-bold rounded-full capitalize`,
        {
          'bg-emerald-200 text-emerald-800 border-emerald-300 hover:bg-emerald-200': status === 'Concluída',
          'bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-200': status === 'Em Andamento',
          'bg-rose-200 text-rose-800 border-rose-300 hover:bg-rose-200': status === 'Pendente',
        },
        className
      )}
    >
      {status}
    </Badge>
  );
}
