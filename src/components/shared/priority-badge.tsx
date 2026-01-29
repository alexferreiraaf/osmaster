'use client';

import type { Priority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        `px-2.5 py-1 text-xs font-bold rounded-full capitalize`,
        {
          'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100': priority === 'Urgente',
          'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100': priority === 'Alta',
          'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100': priority === 'Média',
          'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100': priority === 'Baixa',
        },
        className
      )}
    >
      {priority}
    </Badge>
  );
}
