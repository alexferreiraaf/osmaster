'use client';

import { useRouter } from 'next/navigation';
import { FileText, MoreVertical, Trash2 } from 'lucide-react';
import type { Order, Priority } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '../shared/status-badge';
import PriorityBadge from '../shared/priority-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteOrder } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function OrdersTable({ orders, onOrderDeleted }: { orders: Order[]; onOrderDeleted: (id: string) => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      toast({
        title: 'Sucesso',
        description: "Ordem de serviço deletada.",
      });
      onOrderDeleted(id);
    } catch(error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: (error as Error).message || 'Não foi possível deletar a ordem de serviço.',
      });
    }
  };
  
  if (orders.length === 0) {
    return (
        <div className="text-center py-16">
            <h3 className="text-lg font-semibold">Nenhuma ordem encontrada</h3>
            <p className="text-muted-foreground text-sm">Tente ajustar sua busca ou crie uma nova ordem.</p>
        </div>
    )
  }

  return (
    <>
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
             {orders.map((order) => (
                <Card 
                  key={order.id} 
                  onClick={() => router.push(`/orders/${order.id}`)} 
                  className={cn("cursor-pointer", {
                    'bg-rose-100 dark:bg-rose-500/20': order.priority === 'Urgente',
                    'bg-amber-100 dark:bg-amber-500/20': order.priority === 'Alta',
                    'bg-sky-100 dark:bg-sky-500/20': order.priority === 'Média',
                    'bg-emerald-100 dark:bg-emerald-500/20': order.priority === 'Baixa',
                  })}
                >
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-bold text-primary">OS: {order.id}</CardTitle>
                        <p className="text-base font-semibold">{order.client}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={order.status} />
                        <PriorityBadge priority={order.priority} />
                    </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                    <p>{order.service}</p>
                    <p>Atribuído a: {order.assignedTo || 'Pendente'}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>OS / Cliente</TableHead>
                <TableHead>Atribuído a</TableHead>
                <TableHead>Cidade/Estado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                <TableRow
                    key={order.id}
                    className={cn("transition-colors border-l-4 hover:bg-muted/50", {
                      'border-l-rose-600': order.priority === 'Urgente',
                      'border-l-amber-600': order.priority === 'Alta',
                      'border-l-sky-600': order.priority === 'Média',
                      'border-l-emerald-600': order.priority === 'Baixa',
                    })}
                >
                    <TableCell
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="cursor-pointer"
                    >
                    <div className="font-bold text-primary">{order.id}</div>
                    <div className="text-sm font-medium text-foreground">
                        {order.client}
                    </div>
                    </TableCell>
                    <TableCell>{order.assignedTo || 'Pendente'}</TableCell>
                    <TableCell>
                    {order.city} - {order.state}
                    </TableCell>
                    <TableCell>
                    <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={order.priority} />
                    </TableCell>
                    <TableCell className="text-right">
                         <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical size={18} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => router.push(`/orders/${order.id}`)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Ver Detalhes
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Deletar
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso irá deletar
                                    permanentemente a ordem de serviço {order.id}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(order.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Deletar
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </>
  );
}
