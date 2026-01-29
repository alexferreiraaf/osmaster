'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addEmployee, deleteEmployee as dbDeleteEmployee } from '@/lib/data';
import type { Employee } from '@/lib/types';
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

const FormSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
});

type FormValues = z.infer<typeof FormSchema>;

interface SettingsFormProps {
  employees: Employee[];
  onEmployeeAdded: (name: Employee) => void;
  onEmployeeDeleted: (name: Employee) => void;
}

export function SettingsForm({
  employees,
  onEmployeeAdded,
  onEmployeeDeleted,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await addEmployee(data.name);
        toast({ title: 'Sucesso!', description: `Técnico ${data.name} adicionado.` });
        onEmployeeAdded(data.name);
        form.reset();
      } catch (error: any) {
        if (error.message?.includes('já existe')) {
          form.setError('name', { message: error.message });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: error.message || 'Falha ao adicionar técnico.',
          });
        }
      }
    });
  };

  const handleDelete = (name: string) => {
    startTransition(async () => {
      try {
        await dbDeleteEmployee(name);
        toast({ title: 'Sucesso!', description: `Técnico ${name} removido.` });
        onEmployeeDeleted(name);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.message || 'Falha ao remover técnico.',
        });
      }
    });
  };

  return (
    <div className="bg-card max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border space-y-8">
      <div>
        <div className="flex items-center gap-3 border-b pb-3 mb-4">
          <UserPlus size={20} className="text-primary" />
          <h3 className="font-bold text-lg text-foreground">Adicionar Novo Técnico</h3>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="name">Nome do Técnico</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            Adicionar
            {isPending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground ml-2"></div>}
          </Button>
        </form>
      </div>

      <div>
        <div className="flex items-center gap-3 border-b pb-3 mb-4">
          <Users size={20} className="text-primary" />
          <h3 className="font-bold text-lg text-foreground">Técnicos Atuais</h3>
        </div>
        <div className="space-y-2">
          {employees.map((employee) => (
            <div
              key={employee}
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-secondary/50"
            >
              <p className="font-medium text-sm text-foreground">{employee}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPending}>
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação removerá o técnico {employee}. Ordens de serviço existentes atribuídas a ele serão desvinculadas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(employee)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
           {employees.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum técnico cadastrado.</p>
           )}
        </div>
      </div>
    </div>
  );
}
