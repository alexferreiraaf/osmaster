'use client';

import * as React from 'react';
import Link from 'next/link';
import { getOrders, getOrderStats } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import StatusBadge from '@/components/shared/status-badge';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = {
  total: number;
  ongoing: number;
  completed: number;
  pending: number;
};

export default function DashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<Order[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        getOrderStats(),
        getOrders(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats!.total}
          icon="total"
        />
        <StatCard
          label="Em Andamento"
          value={stats!.ongoing}
          icon="ongoing"
        />
        <StatCard
          label="Concluídas"
          value={stats!.completed}
          icon="completed"
        />
        <StatCard
          label="Pendentes"
          value={stats!.pending}
          icon="pending"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Atualizações</CardTitle>
          <CardDescription>
            As 5 ordens de serviço mais recentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((o) => (
              <Link
                href={`/orders/${o.id}`}
                key={o.id}
                className="flex items-center justify-between p-3 -mx-3 border-b border-transparent last:border-0 cursor-pointer hover:bg-secondary/50 rounded-lg"
              >
                <div>
                  <p className="font-bold text-sm text-foreground">
                    {o.client}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.service} • Atribuído a: {o.assignedTo || 'Não definido'}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ordem de serviço recente.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
