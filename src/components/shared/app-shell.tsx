'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  LogOut
} from 'lucide-react';

import { SearchInput } from './search-input';
import { SidebarItem } from './sidebar-item';
import { getPageTitle } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const pageTitle = getPageTitle(pathname);

  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  // The redirect is handled by the AuthProvider's useEffect.
  // We just need to prevent rendering the shell until the user is resolved or redirected.
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

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
          <SidebarItem icon="dashboard" label="Painel" href="/dashboard" />
          <SidebarItem icon="orders" label="Ordens de Serviço" href="/orders" />
          <SidebarItem icon="new" label="Nova OS" href="/orders/new" />
        </nav>
        
        <div className="space-y-2">
          <SidebarItem icon="settings" label="Configurações" href="/settings" />
           <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto text-base text-slate-500 hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Sair</span>
            </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card/80 backdrop-blur-sm border-b p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {pageTitle}
            </h2>
            <div className='flex items-center gap-4'>
                <div className="hidden sm:block">
                    <SearchInput />
                </div>
                 <div className="text-right">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
