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
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import PriorityBadge from '../shared/priority-badge';

function InfoBadge({ label, value }: { label: string; value: 'Sim' | 'Não' }) {
  const isYes = value === 'Sim';
  return (
    <div className={cn(
      `p-2.5 rounded-lg text-center border transition-all`,
      isYes
        ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
        : 'bg-muted border-border text-muted-foreground'
    )}>
      <p className="text-[10px] font-black uppercase mb-1">{label}</p>
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
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
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
      console.error('Erro ao gerar PDF', err);
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
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
        setChecklist(checklist); 
    }
  };

  const handleSaveDescription = async () => {
    if (description === order.description || !user) return;
    setIsSavingDescription(true);
    try {
      await updateOrderDescription(order.id, description, user);
      toast({ title: 'Observações Salvas' });
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
      router.push('/orders');
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
        setIsUpdating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <Button asChild variant="link" className="px-0 font-bold text-primary hover:text-primary/80">
          <Link href="/orders">← Voltar para lista</Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPdf} variant="outline" className="border-primary text-primary hover:bg-primary/10" disabled={isDownloading}>
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Download size={18} />
            )}
             Baixar OS
          </Button>
        </div>
      </div>

      <Card id="printable-os" className="p-4 sm:p-10 shadow-xl border-t-8 border-t-primary rounded-xl">
        <header className="flex flex-col sm:flex-row justify-between items-start border-b pb-8 mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter">ORDEM #{order.id}</h1>
            <p className="text-muted-foreground font-bold flex items-center gap-1.5 mt-2">
                <Calendar size={16} className="text-primary" /> 
                {order.date && order.date.toDate ? format(order.date.toDate(), "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Data inválida'}
            </p>
            <div className="mt-3">
               <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-black uppercase">
                 Status: {order.status}
               </span>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Técnico Responsável</h3>
            <p className="text-2xl text-primary font-black">
              {order.assignedTo || 'Pendente'}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            <div className="space-y-10">
                <DetailSection title="Dados do Cliente" icon="user">
                    <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 space-y-3">
                        <p className="text-xl font-black text-foreground">{order.client}</p>
                        <div className="space-y-2 text-sm font-medium">
                          <p className="flex items-center gap-2 text-foreground/70"><span className="text-primary font-black w-12 text-[10px] uppercase">Doc:</span> {order.document || 'N/A'}</p>
                          <p className="flex items-center gap-2 text-foreground/70"><Phone size={14} className="text-primary" /> {order.contact || 'N/A'}</p>
                          <p className="flex items-center gap-2 text-foreground/70"><MapPin size={14} className="text-primary" /> {order.city} - {order.state}</p>
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Acesso Remoto e Software" icon="monitor">
                    <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 grid grid-cols-1 gap-6">
                        <div className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase mb-1">{order.remoteTool && order.remoteTool !== 'Nenhum' ? order.remoteTool : 'Acesso Remoto'}</p>
                                <p className="text-lg font-black">{order.remoteCode || '---'}</p>
                            </div>
                            {order.remoteCode && (
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/10" onClick={() => copyToClipboard(order.remoteCode, order.remoteTool || 'Acesso Remoto')}>
                                    <Copy size={20} />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="max-w-[80%]">
                                <p className="text-[10px] font-black text-primary uppercase mb-1">Versão DLL</p>
                                <p className="text-sm font-bold break-all">{order.dll || '---'}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/10" onClick={() => copyToClipboard(order.dll, 'DLL')}>
                                <Copy size={20} />
                            </Button>
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Anexos" icon="attachments">
                  <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase mb-1">Certificado Digital</p>
                        <p className="text-sm font-bold">{order.certificateFileName || 'Não anexado'}</p>
                      </div>
                      {order.certificateDataUrl && (
                        <Button asChild variant="outline" size="sm" className="border-primary text-primary">
                          <a href={order.certificateDataUrl} download={order.certificateFileName}>
                            <Download size={14} className="mr-1" /> Baixar
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase mb-1">Imagem da OS</p>
                        <p className="text-sm font-bold">{order.imageFileName || 'Não anexada'}</p>
                      </div>
                      {order.imageDataUrl && (
                        <Button asChild variant="outline" size="sm" className="border-primary text-primary">
                          <a href={order.imageDataUrl} download={order.imageFileName}>
                            <Download size={14} className="mr-1" /> Baixar
                          </a>
                        </Button>
                      )}
                    </div>
                    {order.imageDataUrl && (
                      <div className="pt-2">
                        <Label className="text-[10px] font-black text-primary uppercase mb-2 block text-center">Pré-visualização da Imagem</Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="group relative rounded-xl overflow-hidden border-2 border-primary/20 cursor-zoom-in">
                               <img
                                src={order.imageDataUrl}
                                alt="Imagem da OS"
                                className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 text-primary p-2 rounded-full shadow-lg"><Monitor size={20} /></span>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                            <DialogTitle className="sr-only">Imagem OS</DialogTitle>
                            <DialogDescription className="sr-only">Visualização ampliada</DialogDescription>
                            <img src={order.imageDataUrl} alt="Imagem da OS" className="rounded-xl w-full h-auto shadow-2xl" />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </DetailSection>

                {order.service !== 'Configuração Fiscal' && (
                  <DetailSection title="Checklist de Implantação" icon="checklist">
                      <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 space-y-4">
                          {(Object.keys(checklist) as Array<keyof ChecklistItems>).map((key) => (
                              <div key={key} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                  <Checkbox
                                  id={key}
                                  checked={checklist[key]}
                                  onCheckedChange={(checked) => handleChecklistChange(key, !!checked)}
                                  className="h-5 w-5 border-primary data-[state=checked]:bg-primary"
                                  />
                                  <Label htmlFor={key} className="text-sm font-bold text-foreground/80 leading-none cursor-pointer">
                                  {checklistLabels[key]}
                                  </Label>
                              </div>
                          ))}
                      </div>
                  </DetailSection>
                )}
            </div>
            
            <div className="space-y-10">
                 <DetailSection title="Configurações de Módulos" icon="settings">
                      <div className="grid grid-cols-3 gap-3">
                        <InfoBadge label="Pedido Agora" value={order.orderNow} />
                        <InfoBadge label="Mobile" value={order.mobile} />
                        <InfoBadge label="iFood" value={order.ifoodIntegration} />
                      </div>
                      {order.ifoodIntegration === 'Sim' && (
                        <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                          <p className="font-black text-amber-800 text-xs mb-3 flex items-center gap-2">
                             <Shield size={14} /> CREDENCIAIS PORTAL IFOOD
                          </p>
                          <div className="space-y-2 text-sm font-medium">
                            <p className="flex gap-2"><strong>E-mail:</strong> <span className="text-amber-900">{order.ifoodEmail || 'N/A'}</span></p>
                            <p className="flex gap-2"><strong>Senha:</strong> <span className="text-amber-900">********</span></p>
                          </div>
                        </div>
                      )}
                </DetailSection>

                <DetailSection title="Sobre o Serviço" icon="hard-drive">
                    <div className="bg-white p-6 rounded-2xl border-2 border-primary/10 shadow-sm space-y-6">
                        <div>
                            <p className="text-2xl font-black text-primary leading-tight">{order.service}</p>
                            <div className="mt-2 flex items-center gap-2">
                               <PriorityBadge priority={order.priority} />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border/50">
                            <Label htmlFor="description" className="text-[10px] font-black text-primary uppercase tracking-widest block mb-3">Observações Adicionais</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                className="bg-secondary/20 border-border/50 focus:border-primary transition-all font-medium text-sm leading-relaxed"
                                placeholder="Descreva os detalhes importantes do atendimento..."
                            />
                            <div className="mt-3 flex justify-end">
                                <Button 
                                    onClick={handleSaveDescription} 
                                    disabled={isSavingDescription || description === order.description} 
                                    size="sm"
                                    className="font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {isSavingDescription ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Salvar Observações'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DetailSection>
                 {order.lastUpdatedBy && order.updatedAt && (
                    <DetailSection title="Histórico de Edição" icon="history">
                      <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 text-sm font-medium space-y-2">
                        <div className='flex items-center gap-2'>
                          <UserCheck size={16} className="text-primary" />
                          <p>Editado por: <span className='font-black text-foreground'>{order.lastUpdatedBy}</span></p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock size={16} className="text-primary" />
                          <p>Data: <span className='font-black text-foreground'>{order.updatedAt.toDate ? format(order.updatedAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}</span></p>
                        </div>
                      </div>
                    </DetailSection>
                )}
            </div>
        </div>
        
        <div className="mt-20 pt-10 border-t grid grid-cols-2 gap-16 text-center print-only hidden">
            <div className="border-t-2 border-foreground pt-4 text-xs font-black uppercase tracking-widest">Assinatura do Técnico</div>
            <div className="border-t-2 border-foreground pt-4 text-xs font-black uppercase tracking-widest">Assinatura do Cliente</div>
        </div>
      </Card>

      {user && (
        <div className="flex flex-col sm:flex-row gap-4 no-print pt-4">
            {order.status === 'Pendente' && (
                <Button 
                    onClick={() => handleUpdateStatus('Em Andamento')} 
                    disabled={isUpdating}
                    size="lg" 
                    className="flex-1 h-14 bg-amber-500 text-white hover:bg-amber-600 font-black text-lg shadow-xl shadow-amber-500/20"
                >
                    <Clock size={20} className="mr-2" /> INICIAR ATENDIMENTO
                </Button>
            )}
            {order.status === 'Em Andamento' && (
                <Button 
                    onClick={() => handleUpdateStatus('Concluída')}
                    disabled={isUpdating}
                    size="lg" 
                    className="flex-1 h-14 bg-emerald-600 text-white hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-600/20"
                >
                    <CheckCircle size={20} className="mr-2" /> FINALIZAR ORDEM
                </Button>
            )}
            {order.status === 'Concluída' && (
                <Button 
                    onClick={() => handleUpdateStatus('Em Andamento')}
                    disabled={isUpdating}
                    size="lg"
                    variant="outline" 
                    className="flex-1 h-14 border-primary text-primary hover:bg-primary/10 font-black text-lg"
                >
                    <RotateCcw size={20} className="mr-2" /> REABRIR ORDEM
                </Button>
            )}
        </div>
      )}
    </div>
  );
}