'use client';

import type { Priority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityStyles: Record<Priority, string> = {
    Urgente: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100',
    Alta: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
    Média: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100',
    Baixa: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        `px-2.5 py-1 text-xs font-bold rounded-full capitalize`,
        priorityStyles[priority] || 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
        className
      )}
    >
      {priority}
    </Badge>
  );
}
