'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus, ShoppingCart, FileCog } from 'lucide-react';
import { cn } from '@/lib/utils';

const options = [
  {
    title: 'Cliente Novo',
    description: 'Criar uma OS completa para um novo cliente ou serviço.',
    href: '/orders/new/client',
    icon: <UserPlus className="h-8 w-8 text-primary" />,
    bgColor: 'bg-blue-600/10 dark:bg-blue-900/20',
    borderColor: 'border-blue-500/20 dark:border-blue-700/50',
  },
  {
    title: 'Pedido Agora',
    description: 'Registrar um pedido do tipo "Pedido Agora".',
    href: '/orders/new/order-now',
    icon: <ShoppingCart className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />,
    bgColor: 'bg-emerald-600/10 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-500/20 dark:border-emerald-700/50',
  },
  {
    title: 'Configuração Fiscal',
    description: 'Abrir uma OS para configuração fiscal.',
    href: '/orders/new/fiscal',
    icon: <FileCog className="h-8 w-8 text-amber-600 dark:text-amber-500" />,
    bgColor: 'bg-amber-600/10 dark:bg-amber-900/20',
    borderColor: 'border-amber-500/20 dark:border-amber-700/50',
  },
];

export default function NewOrderSelectionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Criar Nova Ordem de Serviço</h1>
        <p className="text-muted-foreground mt-2">Selecione o tipo de ordem de serviço que você deseja criar.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => (
          <Link href={option.href} key={option.title} className="block hover:scale-105 transition-transform duration-200">
            <Card className={cn("h-full flex flex-col text-center items-center justify-center p-6 border-2", option.bgColor, option.borderColor)}>
              <CardHeader className="p-0 items-center">
                <div className="mb-4">{option.icon}</div>
                <CardTitle>{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
