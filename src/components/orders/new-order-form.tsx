'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Settings,
  Shield,
  HardDrive,
  Check,
  Wand2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';

import { createOrder, suggestTechnicianAction } from '@/app/orders/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/lib/types';

const FormSchema = z.object({
  client: z.string().min(1, 'Nome do cliente é obrigatório.'),
  document: z.string().optional(),
  contact: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória.'),
  state: z.string().min(1, 'Estado é obrigatório.'),
  assignedTo: z.string().optional(),
  orderNow: z.enum(['Sim', 'Não']),
  mobile: z.enum(['Sim', 'Não']),
  ifoodIntegration: z.enum(['Sim', 'Não']),
  ifoodEmail: z.string().optional(),
  ifoodPassword: z.string().optional(),
  dll: z.string().optional(),
  remoteCode: z.string().optional(),
  certificateFile: z.instanceof(File).optional(),
  service: z.string().min(1, 'Título do serviço é obrigatório.'),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

type FormIconType = 'user' | 'settings' | 'shield' | 'hard-drive';

const formIconMap: Record<FormIconType, ReactNode> = {
    user: <User size={20} className="text-primary" />,
    settings: <Settings size={20} className="text-primary" />,
    shield: <Shield size={20} className="text-primary" />,
    'hard-drive': <HardDrive size={20} className="text-primary" />,
};

const FormSection = ({ title, icon, children }: { title: string, icon: FormIconType, children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 border-b pb-3">
      {formIconMap[icon]}
      <h3 className="font-bold text-lg text-foreground">{title}</h3>
    </div>
    {children}
  </div>
);

export function NewOrderForm({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      orderNow: 'Não',
      mobile: 'Não',
      ifoodIntegration: 'Não',
      priority: 'Média',
    },
  });

  const ifoodIntegration = watch('ifoodIntegration');

  const handleSuggestTechnician = async () => {
    const { service, city, state } = getValues();
    if (!service || !city || !state) {
      toast({
        variant: 'destructive',
        title: 'Campos necessários',
        description: 'Preencha "Título do Serviço", "Cidade" e "Estado" para obter uma sugestão.',
      });
      return;
    }
    
    setIsSuggesting(true);
    const result = await suggestTechnicianAction({ service, clientCity: city, clientState: state });
    setIsSuggesting(false);

    if (result.success && result.data) {
        const suggested = result.data.suggestedTechnician;
        if (employees.includes(suggested)) {
            setValue('assignedTo', suggested);
            toast({
                title: 'Técnico Sugerido!',
                description: `${suggested} - ${result.data.reason}`,
            });
        } else {
             toast({
                title: 'Sugestão: ' + suggested,
                description: result.data.reason,
            });
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: result.message || 'Não foi possível obter uma sugestão.',
        });
    }
  };


  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      const finalData = { ...data };
      if (finalData.assignedTo === 'none') {
        finalData.assignedTo = '';
      }

      Object.entries(finalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const result = await createOrder(formData);
      if (result?.errors) {
        // Handle errors
      } else if (result?.message) {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
      } else {
        toast({ title: 'Sucesso!', description: 'Nova ordem de serviço criada.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FormSection title="Dados do Cliente" icon="user">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="client">Nome do Cliente *</Label>
            <Input id="client" {...register('client')} />
            {errors.client && <p className="text-destructive text-xs mt-1">{errors.client.message}</p>}
          </div>
          <div><Label htmlFor="document">CPF/CNPJ</Label><Input id="document" {...register('document')} /></div>
          <div><Label htmlFor="contact">Contato (Tel/E-mail)</Label><Input id="contact" {...register('contact')} /></div>
          <div>
            <Label htmlFor="city">Cidade *</Label>
            <Input id="city" {...register('city')} />
            {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="state">Estado *</Label>
            <Input id="state" placeholder="Ex: SP" {...register('state')} />
            {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Atribuído para</Label>
            <div className="flex items-center gap-2">
                <Controller
                control={control}
                name="assignedTo"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {employees.map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                    </SelectContent>
                    </Select>
                )}
                />
                <Button type="button" size="icon" variant="outline" onClick={handleSuggestTechnician} disabled={isSuggesting} aria-label="Sugerir Técnico">
                    {isSuggesting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : <Wand2 size={16} />}
                </Button>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Configurações e Integrações" icon="settings">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['orderNow', 'mobile', 'ifoodIntegration'].map((id) => (
            <div key={id}>
              <Label>{id === 'orderNow' ? 'Pedido Agora' : id === 'mobile' ? 'Mobile' : 'Integração iFood'}</Label>
              <Controller
                control={control}
                name={id as 'orderNow' | 'mobile' | 'ifoodIntegration'}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent>
                  </Select>
                )}
              />
            </div>
          ))}
        </div>
        {ifoodIntegration === 'Sim' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
            <div><Label htmlFor="ifoodEmail">E-mail Portal iFood</Label><Input id="ifoodEmail" {...register('ifoodEmail')} /></div>
            <div><Label htmlFor="ifoodPassword">Senha Portal iFood</Label><Input id="ifoodPassword" type="password" {...register('ifoodPassword')} /></div>
          </div>
        )}
      </FormSection>

      <FormSection title="Dados Técnicos e Acesso" icon="shield">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div><Label htmlFor="dll">DLL</Label><Input id="dll" {...register('dll')} /></div>
          <div><Label htmlFor="remoteCode">AnyDesk / TeamViewer</Label><Input id="remoteCode" {...register('remoteCode')} /></div>
          <div>
            <Label htmlFor="certificateFile">Certificado Digital (.pfx)</Label>
            <Input id="certificateFile" type="file" accept=".pfx" {...register('certificateFile')} className="pt-2"/>
          </div>
        </div>
      </FormSection>

      <FormSection title="Sobre o Serviço" icon="hard-drive">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="service">Título do Serviço *</Label>
            <Input id="service" {...register('service')} />
            {errors.service && <p className="text-destructive text-xs mt-1">{errors.service.message}</p>}
          </div>
          <div>
            <Label>Prioridade</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Observações</Label>
          <Textarea id="description" rows={3} {...register('description')} />
        </div>
      </FormSection>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" size="lg" className="flex-1" disabled={isPending}>
          <Check size={20} /> Salvar Ordem de Serviço
          {isPending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground ml-2"></div>}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push('/orders')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
