'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Plus, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type IconType = 'dashboard' | 'orders' | 'new' | 'settings';

const iconMap: Record<IconType, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  orders: <FileText size={20} />,
  new: <Plus size={20} />,
  settings: <Settings size={20} />,
};

export function SidebarItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: IconType;
  label: string;
}) {
  const pathname = usePathname();
  let isActive = false;

  if (href === '/orders') {
    isActive = pathname.startsWith('/orders') && !pathname.startsWith('/orders/new');
  } else {
    isActive = pathname.startsWith(href);
  }


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
        {iconMap[icon]}
        <span>{label}</span>
      </Link>
    </Button>
  );
}
