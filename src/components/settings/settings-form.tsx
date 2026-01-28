'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addEmployeeAction, deleteEmployeeAction } from '@/app/settings/actions';
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

export function SettingsForm({ employees }: { employees: Employee[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', data.name);
      const result = await addEmployeeAction(formData);

      if (result.errors) {
        form.setError('name', { message: result.errors.name?.join(', ') });
      } else if (result.success) {
        toast({ title: 'Sucesso!', description: result.message });
        form.reset();
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
      }
    });
  };

  const handleDelete = (name: string) => {
    startTransition(async () => {
      const result = await deleteEmployeeAction(name);
      if (result.success) {
        toast({ title: 'Sucesso!', description: result.message });
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
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
