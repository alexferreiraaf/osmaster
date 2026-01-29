'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
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
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result = await registerUser(data);
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Falha no cadastro',
        description: result.message,
      });
      setLoading(false);
    } else {
        toast({
            title: 'Cadastro realizado com sucesso!',
            description: 'Você será redirecionado para o painel.',
        });
        // router.push('/dashboard'); The provider will redirect
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
            <CardTitle>Criar sua conta</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para se cadastrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>}
                Cadastrar
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/" className="text-primary hover:underline">
                    Faça login
                </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
