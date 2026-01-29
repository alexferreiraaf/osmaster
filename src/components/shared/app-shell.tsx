'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardList,
  LogOut,
  User as UserIcon,
  Menu,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useOrderNotifications } from '@/hooks/use-order-notifications';

import { SearchInput } from './search-input';
import { SidebarItem } from './sidebar-item';
import { getPageTitle } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const SidebarNav = () => (
    <nav className="space-y-2 flex-1">
        <SidebarItem icon="dashboard" label="Painel" href="/dashboard" />
        <SidebarItem icon="orders" label="Ordens de Serviço" href="/orders" />
        <SidebarItem icon="new" label="Nova OS" href="/orders/new" />
    </nav>
);


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);
  const { user, logout } = useAuth();
  
  useOrderNotifications();

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        {children}
      </div>
    );
  }

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
        <SidebarNav />
        <div className="space-y-2">
          <SidebarItem icon="settings" label="Configurações" href="/settings" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-card/80 backdrop-blur-sm border-b p-4 sticky top-0 z-10 flex justify-between items-center md:max-w-7xl md:mx-auto w-full">
            <div className="flex items-center gap-2">
                 <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-4 w-72 bg-card flex flex-col">
                             <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
                                <div className="bg-primary p-2 rounded-lg">
                                    <ClipboardList size={24} className="text-primary-foreground" />
                                </div>
                                <h1 className="text-xl font-bold tracking-tight text-primary">
                                    OS Master
                                </h1>
                            </div>
                            <SidebarNav />
                             <div className="space-y-2">
                                <SidebarItem icon="settings" label="Configurações" href="/settings" />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                <h2 className="text-xl font-semibold text-foreground capitalize">
                    {pageTitle}
                </h2>
            </div>
            
            <div className='flex items-center gap-4'>
                <div className="hidden sm:block">
                    <SearchInput />
                </div>
                <ThemeToggle />
                <div className="hidden md:block">
                    {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src="#" alt={user.name} />
                            <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:max-w-7xl md:mx-auto w-full pb-24 md:pb-6">
            {children}
        </main>
        
        <footer className="md:hidden bg-card border-t p-2 fixed bottom-0 left-0 right-0 z-20">
            <div className="flex justify-around items-start">
                <SidebarItem href="/dashboard" icon="dashboard" label="Painel" layout="bottom-nav" />
                <SidebarItem href="/orders" icon="orders" label="Ordens" layout="bottom-nav" />
                <SidebarItem href="/orders/new" icon="new" label="Nova OS" layout="bottom-nav" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex-col h-auto p-2 space-y-1 flex-1 text-slate-500">
                             <UserIcon size={20} />
                             <span className="text-xs">Conta</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => router.push('/settings')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configurações</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
        </footer>
      </div>
    </div>
  );
}
