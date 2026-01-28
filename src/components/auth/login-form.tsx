'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth-provider';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList } from 'lucide-react';


const FormSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(1, 'Senha é obrigatória.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result = await login(data);
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description: result.message,
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
                <div className="bg-primary p-2 rounded-lg inline-block">
                    <ClipboardList size={28} className="text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                    OS Master
                </h1>
            </div>
            <CardTitle>Bem-vindo de volta!</CardTitle>
            <CardDescription>
              Faça login para gerenciar as ordens de serviço.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className='text-xs text-muted-foreground pt-4'>
                <p>Use as credenciais abaixo para testar:</p>
                <p><b>Email:</b> tecnico@email.com / <b>Senha:</b> password</p>
                <p><b>Email:</b> admin@email.com / <b>Senha:</b> admin</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>}
                Entrar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
