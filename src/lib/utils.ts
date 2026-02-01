import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPageTitle(pathname: string) {
  if (pathname.endsWith('/edit')) return 'Editar Ordem de Serviço';
  if (pathname === '/orders/new') return 'Nova Ordem de Serviço';
  if (pathname === '/orders/new/client') return 'Nova OS: Cliente Novo';
  if (pathname === '/orders/new/order-now') return 'Nova OS: Pedido Agora';
  if (pathname === '/orders/new/fiscal') return 'Nova OS: Configuração Fiscal';
  if (pathname.startsWith('/settings')) return 'Configurações';
  if (pathname.startsWith('/orders/')) return 'Detalhes da OS';
  if (pathname.startsWith('/orders')) return 'Todas as Ordens';
  if (pathname.startsWith('/dashboard')) return 'Resumo Geral';
  return 'OS Manager Pro';
}
