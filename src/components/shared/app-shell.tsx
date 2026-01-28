'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  LayoutDashboard,
  FileText,
  Plus,
  Search,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchInput } from './search-input';

function SidebarItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      asChild
      variant={isActive ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 p-3 h-auto text-base',
        isActive ? 'bg-primary/90 text-primary-foreground' : 'text-slate-500 hover:bg-primary/10 hover:text-primary',
      )}
    >
      <Link href={href}>
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/orders/new')) return 'Nova Ordem de Serviço';
  if (pathname.startsWith('/orders/')) return 'Detalhes da OS';
  if (pathname.startsWith('/orders')) return 'Todas as Ordens';
  if (pathname.startsWith('/dashboard')) return 'Resumo Geral';
  return 'OS Manager Pro';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside className="w-64 bg-card text-card-foreground p-4 hidden md:flex flex-col border-r">
        <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
          <div className="bg-primary p-2 rounded-lg">
            <ClipboardList size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">
            OS Master
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Painel" href="/dashboard" />
          <SidebarItem icon={<FileText size={20} />} label="Ordens de Serviço" href="/orders" />
          <SidebarItem icon={<Plus size={20} />} label="Nova OS" href="/orders/new" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card/80 backdrop-blur-sm border-b p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {pageTitle}
            </h2>
            <div className="hidden sm:block">
              <SearchInput />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
