import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPageTitle(pathname: string) {
  if (pathname.startsWith('/orders/new')) return 'Nova Ordem de Serviço';
  if (pathname.startsWith('/orders/')) return 'Detalhes da OS';
  if (pathname.startsWith('/orders')) return 'Todas as Ordens';
  if (pathname.startsWith('/dashboard')) return 'Resumo Geral';
  return 'OS Manager Pro';
}
