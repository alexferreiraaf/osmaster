'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ListChecks,
  UserCheck,
  Calendar,
  Copy,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Order, Employee, ChecklistItems, OrderStatus } from '@/lib/types';
import { updateOrderStatus, updateOrderChecklist, updateOrderDescription } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../auth/auth-provider';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

type DetailIconType = 'user' | 'monitor' | 'settings' | 'hard-drive' | 'checklist' | 'history' | 'attachments';

const detailIconMap: Record<DetailIconType, React.ReactNode> = {
    user: <User size={14} />,
    monitor: <Monitor size={14} />,
    settings: <Settings size={14} />,
    'hard-drive': <HardDrive size={14} />,
    checklist: <ListChecks size={14} />,
    history: <Clock size={14} />,
    attachments: <Paperclip size={14} />,
};

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: DetailIconType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
        {detailIconMap[icon]} {title}
      </h4>
      {children}
    </div>
  );
}

export default function OrderDetails({ order, employees }: { order: Order, employees: Employee[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [checklist, setChecklist] = React.useState<ChecklistItems>(order.checklist);
  const [description, setDescription] = React.useState(order.description);
  const [isSavingDescription, setIsSavingDescription] = React.useState(false);

  const handleDownloadPdf = () => {
    const input = document.getElementById('printable-os');
    if (!input) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Baixar PDF',
        description: 'Elemento da OS não encontrado para gerar o PDF.',
      });
      return;
    }
    
    setIsDownloading(true);

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth / ratio;
      
      let heightToFit = imgHeight < pdfHeight ? imgHeight : pdfHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, heightToFit);
      pdf.save(`OS-${order.id}.pdf`);

      toast({
        title: 'Download Iniciado',
        description: `O arquivo OS-${order.id}.pdf será baixado.`,
      });
    }).catch(err => {
      console.error('oops, something went wrong!', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um problema ao criar o arquivo PDF.',
      });
    }).finally(() => {
      setIsDownloading(false);
    });
  };

  const copyToClipboard = (text: string | undefined, fieldName: string) => {
    if (!text) {
        toast({
            variant: 'destructive',
            title: 'Campo vazio',
            description: `Não há nada para copiar no campo ${fieldName}.`,
        });
        return;
    }
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copiado!',
        description: `${fieldName} copiado para a área de transferência.`,
    });
  };

  const handleChecklistChange = async (item: keyof ChecklistItems, checked: boolean) => {
    if (!user) return;
    const updatedChecklist = { ...checklist, [item]: checked };
    setChecklist(updatedChecklist);
    
    try {
      await updateOrderChecklist(order.id, updatedChecklist, user);
      toast({ title: 'Checklist Atualizado' });
      router.refresh();
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
    }
  };

  const handleSaveDescription = async () => {
    if (description === order.description || !user) return;
    setIsSavingDescription(true);
    try {
      await updateOrderDescription(order.id, description, user);
      toast({ title: 'Observações Salvas' });
      router.refresh();
    } catch(error) {
      toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
    }
    setIsSavingDescription(false);
  };

  const checklistLabels: Record<keyof ChecklistItems, string> = {
    importacaoProdutos: 'Importação dos Produtos',
    adicionaisOpcionais: 'Adicionais/Opcionais',
    codigoPDV: 'Código PDV',
    preco: 'Preço',
    bairros: 'Bairros',
    imagens: 'Imagens',
    fiscal: 'Fiscal',
  };


  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, status, user.name);
      toast({ title: 'Status Atualizado', description: `Ordem agora está "${status}".`});
      router.refresh();
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
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
          <Button onClick={handleDownloadPdf} variant="outline" disabled={isDownloading}>
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Download size={18} />
            )}
             Baixar OS
          </Button>
        </div>
      </div>

      <Card id="printable-os" className="p-4 sm:p-8">
        <header className="flex justify-between items-start border-b pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">{order.id}</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar size={14} /> 
                {order.date && order.date.toDate ? format(order.date.toDate(), "dd 'de' MMMM, yyyy", { locale: ptBR, timeZone: 'UTC' }) : 'Data inválida'}
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
                <DetailSection title="Dados do Cliente" icon="user">
                    <div className="bg-secondary/50 p-4 rounded-xl space-y-2">
                        <p className="text-lg font-bold">{order.client}</p>
                        <p className="text-sm text-foreground/80"><span className="font-semibold">Doc:</span> {order.document || 'N/A'}</p>
                        <p className="text-sm text-foreground/80 flex items-center gap-1.5"><Phone size={14} /> {order.contact || 'N/A'}</p>
                        <p className="text-sm text-foreground/80 flex items-center gap-1.5"><MapPin size={14} /> {order.city} - {order.state}</p>
                    </div>
                </DetailSection>

                <DetailSection title="Acesso Remoto e Software" icon="monitor">
                    <div className="bg-secondary/50 p-4 rounded-xl grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">AnyDesk/TV</p>
                                <p className="text-sm font-bold">{order.remoteCode || '---'}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(order.remoteCode, 'Acesso Remoto')}>
                                <Copy size={16} />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">DLL Versão</p>
                                <p className="text-sm font-bold">{order.dll && order.dll.length > 20 ? `${order.dll.substring(0, 20)}...` : order.dll || '---'}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(order.dll, 'DLL')}>
                                <Copy size={16} />
                            </Button>
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Anexos" icon="attachments">
                  <div className="bg-secondary/50 p-4 rounded-xl grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          Certificado Digital
                        </p>
                        <p className="text-sm font-bold">
                          {order.certificateFileName || 'Nenhum'}
                        </p>
                      </div>
                      {order.certificateDataUrl && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <a href={order.certificateDataUrl} download={order.certificateFileName}>
                            <Download size={16} />
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          Imagem
                        </p>
                        <p className="text-sm font-bold">
                          {order.imageFileName || 'Nenhuma'}
                        </p>
                      </div>
                      {order.imageDataUrl && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <a href={order.imageDataUrl} download={order.imageFileName}>
                            <Download size={16} />
                          </a>
                        </Button>
                      )}
                    </div>
                    {order.imageDataUrl && (
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                          Pré-visualização
                        </Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <img
                              src={order.imageDataUrl}
                              alt="Imagem da OS"
                              className="mt-1 rounded-lg border aspect-video w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-2">
                            <DialogTitle className="sr-only">Visualização de Imagem</DialogTitle>
                            <DialogDescription className="sr-only">Imagem da ordem de serviço ampliada.</DialogDescription>
                            <img
                              src={order.imageDataUrl}
                              alt="Imagem da OS"
                              className="rounded-lg w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </DetailSection>

                 <DetailSection title="Checklist de Implantação" icon="checklist">
                    <div className="bg-secondary/50 p-4 rounded-xl space-y-3">
                        {(Object.keys(checklist) as Array<keyof ChecklistItems>).map((key) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                id={key}
                                checked={checklist[key]}
                                onCheckedChange={(checked) => handleChecklistChange(key, !!checked)}
                                />
                                <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {checklistLabels[key]}
                                </Label>
                            </div>
                        ))}
                    </div>
                </DetailSection>
            </div>
            
            <div className="space-y-6">
                 <DetailSection title="Status de Módulos" icon="settings">
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

                <DetailSection title="Detalhes do Serviço" icon="hard-drive">
                    <div className="border-l-4 border-primary pl-4 py-1 space-y-3">
                        <div>
                            <p className="font-bold text-lg text-foreground">{order.service}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Prioridade: {order.priority}</p>
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase">Observações</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="mt-1"
                                placeholder="Nenhuma observação."
                            />
                            <Button 
                                onClick={handleSaveDescription} 
                                disabled={isSavingDescription || description === order.description} 
                                size="sm" 
                                className="mt-2"
                            >
                                Salvar Observações
                                {isSavingDescription && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground ml-2"></div>}
                            </Button>
                        </div>
                    </div>
                </DetailSection>
                 {order.lastUpdatedBy && order.updatedAt && (
                    <DetailSection title="Histórico" icon="history">
                      <div className="bg-secondary/50 p-4 rounded-xl text-sm">
                        <div className='flex items-center gap-1.5'>
                          <UserCheck size={14} className="text-muted-foreground" />
                          <p>Última alteração por: <span className='font-semibold'>{order.lastUpdatedBy}</span></p>
                        </div>
                        <div className='flex items-center gap-1.5 mt-1'>
                          <Calendar size={14} className="text-muted-foreground" />
                          <p>Em: {order.updatedAt.toDate ? format(order.updatedAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}</p>
                        </div>
                      </div>
                    </DetailSection>
                )}
            </div>
        </div>
        
        <div className="mt-16 pt-8 border-t grid grid-cols-2 gap-8 text-center print-only hidden">
            <div className="border-t pt-2 text-xs font-bold text-muted-foreground uppercase">Assinatura do Técnico</div>
            <div className="border-t pt-2 text-xs font-bold text-muted-foreground uppercase">Assinatura do Cliente</div>
        </div>
      </Card>

      {order.status !== 'Concluída' && user &&(
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
