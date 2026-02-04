'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FileText, MoreVertical, Trash2, Pencil } from 'lucide-react';
import type { Order } from '@/lib/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

const getOrderType = (order: Order): string => {
  if (order.service === 'Configuração Fiscal') {
    return 'Configuração Fiscal';
  }
  if (order.orderNow === 'Sim') {
    return 'Pedido Agora';
  }
  return 'Cliente Novo';
};

export default function OrdersTable({ orders, onOrderDeleted }: { orders: Order[]; onOrderDeleted: (id: string) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteOrder(id);
      toast({
        title: 'Sucesso',
        description: "Ordem de serviço deletada com sucesso.",
      });
      onOrderDeleted(id);
    } catch(error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: (error as Error).message || 'Não foi possível deletar a ordem de serviço.',
      });
    } finally {
      setIsDeleting(null);
      setOpenDropdownId(null);
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
        <div className="md:hidden space-y-3 p-4">
             {orders.map((order) => (
                <Card 
                  key={order.id} 
                  onClick={() => router.push(`/orders/${order.id}`)} 
                  className={cn("cursor-pointer border-l-4 transition-all hover:shadow-md", {
                    'border-l-rose-500 bg-rose-50/30': order.priority === 'Urgente',
                    'border-l-amber-500 bg-amber-50/30': order.priority === 'Alta',
                    'border-l-sky-500': order.priority === 'Média',
                    'border-l-emerald-500': order.priority === 'Baixa',
                  })}
                >
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-bold text-primary">OS: {order.id}</CardTitle>
                        <p className="text-base font-bold truncate max-w-[150px]">{order.client}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={order.status} />
                        <PriorityBadge priority={order.priority} />
                    </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                    <p className="font-medium">{order.service}</p>
                    <p>Atribuído a: {order.assignedTo || 'Pendente'}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">OS / Cliente</TableHead>
                <TableHead>Atribuído a</TableHead>
                <TableHead>Tipo de OS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                <TableRow
                    key={order.id}
                    className={cn("transition-colors cursor-default", {
                      'bg-rose-50/80 hover:bg-rose-100/80 dark:bg-rose-950/20': order.priority === 'Urgente',
                      'bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/20': order.priority === 'Alta',
                    })}
                >
                    <TableCell
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="cursor-pointer"
                    >
                    <div className="font-black text-primary text-base">{order.id}</div>
                    <div className="text-sm font-bold text-foreground">
                        {order.client}
                    </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.assignedTo || 'Pendente'}</TableCell>
                    <TableCell className="font-bold text-muted-foreground">
                      {getOrderType(order)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={order.priority} />
                    </TableCell>
                    <TableCell className="text-right">
                         <AlertDialog>
                            <DropdownMenu 
                              open={openDropdownId === order.id} 
                              onOpenChange={(open) => setOpenDropdownId(open ? order.id : null)}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical size={18} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Ver Detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/edit`)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Deletar
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Deseja realmente deletar a ordem de serviço {order.id}? Esta ação é permanente.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(order.id);
                                    }}
                                    disabled={isDeleting === order.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting === order.id ? 'Deletando...' : 'Deletar'}
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