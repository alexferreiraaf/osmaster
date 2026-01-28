'use client';

import { useRouter } from 'next/navigation';
import { FileText, Trash2 } from 'lucide-react';
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
import { deleteOrder } from '@/app/orders/actions';
import { useToast } from '@/hooks/use-toast';

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const result = await deleteOrder(id);
    if (result.message) {
      toast({
        title: 'Sucesso',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível deletar a ordem de serviço.',
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>OS / Cliente</TableHead>
          <TableHead>Atribuído a</TableHead>
          <TableHead>Cidade/Estado</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="hover:bg-muted/50 transition-colors"
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
            <TableCell className="text-right">
              <div className="flex space-x-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/orders/${order.id}`)}
                  aria-label="Ver detalhes"
                >
                  <FileText size={18} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      aria-label="Deletar"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </AlertDialogTrigger>
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
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
