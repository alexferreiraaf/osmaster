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
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


const FormSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(1, 'Senha é obrigatória.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function LoginForm() {
  const { login, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    }
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

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'E-mail inválido',
        description: 'Por favor, insira um e-mail válido para redefinir a senha.',
      });
      return;
    }

    setResetLoading(true);
    const result = await resetPassword(resetEmail);
    setResetLoading(false);

    if (result.success) {
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: result.message,
      });
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <button 
                      type="button" 
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Esqueci minha senha
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Redefinir Senha</DialogTitle>
                      <DialogDescription>
                        Insira seu e-mail abaixo. Enviaremos um link para você criar uma nova senha.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">E-mail</Label>
                        <Input
                          id="reset-email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        onClick={handleResetPassword} 
                        disabled={resetLoading}
                        className="w-full"
                      >
                        {resetLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>}
                        Enviar Link de Redefinição
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>}
                    Entrar
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}