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
          'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100': status === 'Concluída',
          'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100': status === 'Em Andamento',
          'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100': status === 'Pendente',
        },
        className
      )}
    >
      {status}
    </Badge>
  );
}
