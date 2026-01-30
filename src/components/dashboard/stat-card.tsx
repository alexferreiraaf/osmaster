'use client';

import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type IconType = 'total' | 'ongoing' | 'completed' | 'pending';

const iconMap: Record<IconType, ReactNode> = {
    total: <FileText size={20} />,
    ongoing: <Clock size={20} />,
    completed: <CheckCircle2 size={20} />,
    pending: <AlertCircle size={20} />,
};

const colorMap: Record<IconType, string> = {
  total: 'bg-blue-600',
  ongoing: 'bg-amber-600',
  completed: 'bg-emerald-600',
  pending: 'bg-rose-600',
};

interface StatCardProps {
  label: string;
  value: number;
  icon: IconType;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn('p-2.5 rounded-lg text-white', colorMap[icon])}>
          {iconMap[icon]}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
