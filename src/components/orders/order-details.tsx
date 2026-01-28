'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Download,
  User,
  Phone,
  MapPin,
  Monitor,
  Settings,
  HardDrive,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Order } from '@/lib/types';
import { updateOrderStatus } from '@/app/orders/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


function InfoBadge({ label, value }: { label: string; value: 'Sim' | 'Não' }) {
    const isYes = value === 'Sim';
    return (
      <div className={cn(
        `p-2.5 rounded-lg text-center border`, 
        isYes 
          ? 'bg-primary/10 border-primary/20 text-primary' 
          : 'bg-muted border-border text-muted-foreground'
      )}>
        <p className="text-[10px] font-bold uppercase mb-1">{label}</p>
        <p className="text-sm font-black">{value}</p>
      </div>
    );
  }

function DetailSection({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <Icon size={14} /> {title}
        </h4>
        {children}
      </div>
    );
  }

export default function OrderDetails({ order }: { order: Order }) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateStatus = async (status: 'Em Andamento' | 'Concluída') => {
    setIsUpdating(true);
    const result = await updateOrderStatus(order.id, status);
    if(result.message?.includes('sucesso')) {
        toast({ title: 'Status Atualizado', description: `Ordem agora está "${status}".`});
    } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
    setIsUpdating(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <Button asChild variant="link" className="px-0">
          <Link href="/orders">← Voltar para lista</Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline">
            <Download size={18} /> Imprimir
          </Button>
        </div>
      </div>

      <Card id="printable-os" className="p-4 sm:p-8">
        <header className="flex justify-between items-start border-b pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">{order.id}</h1>
            <p className="text-muted-foreground font-medium">
              Data de Abertura: {new Date(order.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </p>
            <p className="text-primary font-bold mt-1">Status: {order.status}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-foreground">Responsável</h3>
            <p className="text-lg text-primary font-semibold">
              {order.assignedTo || 'Não atribuído'}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
                <DetailSection title="Dados do Cliente" icon={User}>
                    <div className="bg-secondary/50 p-4 rounded-xl space-y-2">
                        <p className="text-lg font-bold">{order.client}</p>
                        <p className="text-sm text-foreground/80"><span className="font-semibold">Doc:</span> {order.document || 'N/A'}</p>
                        <p className="text-sm text-foreground/80 flex items-center gap-1.5"><Phone size={14} /> {order.contact || 'N/A'}</p>
                        <p className="text-sm text-foreground/80 flex items-center gap-1.5"><MapPin size={14} /> {order.city} - {order.state}</p>
                    </div>
                </DetailSection>

                <DetailSection title="Acesso Remoto e Software" icon={Monitor}>
                    <div className="bg-secondary/50 p-4 rounded-xl grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">AnyDesk/TV</p>
                            <p className="text-sm font-bold">{order.remoteCode || '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">DLL Versão</p>
                            <p className="text-sm font-bold">{order.dll || '---'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Certificado Digital</p>
                            <p className="text-sm font-bold">{order.certificateFile || 'Nenhum arquivo enviado'}</p>
                        </div>
                    </div>
                </DetailSection>
            </div>
            
            <div className="space-y-6">
                 <DetailSection title="Status de Módulos" icon={Settings}>
                      <div className="grid grid-cols-3 gap-2">
                        <InfoBadge label="Pedido Agora" value={order.orderNow} />
                        <InfoBadge label="Mobile" value={order.mobile} />
                        <InfoBadge label="iFood" value={order.ifoodIntegration} />
                      </div>
                      {order.ifoodIntegration === 'Sim' && (
                        <div className="mt-3 p-3 bg-amber-100/50 border border-amber-200/80 rounded-lg text-xs">
                          <p className="font-bold text-amber-800 mb-1 underline">Credenciais iFood Portal:</p>
                          <p><strong>E-mail:</strong> {order.ifoodEmail}</p>
                          <p><strong>Senha:</strong> ********</p>
                        </div>
                      )}
                </DetailSection>

                <DetailSection title="Detalhes do Serviço" icon={HardDrive}>
                      <div className="border-l-4 border-primary pl-4 py-1">
                        <p className="font-bold text-lg text-foreground">{order.service}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase mt-3">Prioridade: {order.priority}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase mt-3">Observações:</p>
                        <p className="text-sm text-foreground/80 mt-1 italic">"{order.description || 'Sem observações adicionais.'}"</p>
                      </div>
                </DetailSection>
            </div>
        </div>
        
        <div className="mt-16 pt-8 border-t grid grid-cols-2 gap-8 text-center print-only hidden">
            <div className="border-t pt-2 text-xs font-bold text-muted-foreground uppercase">Assinatura do Técnico</div>
            <div className="border-t pt-2 text-xs font-bold text-muted-foreground uppercase">Assinatura do Cliente</div>
        </div>
      </Card>

      {order.status !== 'Concluída' && (
        <div className="flex gap-4 no-print">
            {order.status === 'Pendente' && (
                <Button 
                    onClick={() => handleUpdateStatus('Em Andamento')} 
                    disabled={isUpdating}
                    size="lg" 
                    className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                >
                    <Clock size={18} /> Iniciar Atendimento
                </Button>
            )}
            {order.status === 'Em Andamento' && (
                <Button 
                    onClick={() => handleUpdateStatus('Concluída')}
                    disabled={isUpdating}
                    size="lg" 
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    <CheckCircle size={18} /> Finalizar Ordem
                </Button>
            )}
        </div>
      )}
    </div>
  );
}
