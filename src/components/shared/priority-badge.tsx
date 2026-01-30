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
          'bg-rose-200 text-rose-800 border-rose-300 hover:bg-rose-200': priority === 'Urgente',
          'bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-200': priority === 'Alta',
          'bg-sky-200 text-sky-800 border-sky-300 hover:bg-sky-200': priority === 'Média',
          'bg-emerald-200 text-emerald-800 border-emerald-300 hover:bg-emerald-200': priority === 'Baixa',
        },
        className
      )}
    >
      {priority}
    </Badge>
  );
}
