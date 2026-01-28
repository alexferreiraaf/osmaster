import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn('p-2.5 rounded-lg text-white', color)}>
          <Icon size={20} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
