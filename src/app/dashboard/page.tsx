import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getOrderStats(),
    getOrders(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon="total"
          color="bg-blue-500"
        />
        <StatCard
          label="Em Andamento"
          value={stats.ongoing}
          icon="ongoing"
          color="bg-amber-500"
        />
        <StatCard
          label="Concluídas"
          value={stats.completed}
          icon="completed"
          color="bg-emerald-500"
        />
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon="pending"
          color="bg-rose-500"
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
            {recentOrders.slice(0, 5).map((o) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
