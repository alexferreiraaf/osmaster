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
  layout = 'default'
}: {
  href: string;
  icon: IconType;
  label: string;
  layout?: 'default' | 'bottom-nav';
}) {
  const pathname = usePathname();
  let isActive = false;

  if (href === '/orders') {
    isActive = pathname.startsWith('/orders') && !pathname.startsWith('/orders/new');
  } else {
    isActive = pathname.startsWith(href);
  }

  if (layout === 'bottom-nav') {
      return (
          <Button
            asChild
            variant='ghost'
            className={cn(
                'flex-col h-auto p-2 space-y-1 flex-1',
                isActive ? 'text-primary bg-primary/10' : 'text-slate-500'
            )}
            >
            <Link href={href}>
                {iconMap[icon]}
                <span className="text-xs">{label}</span>
            </Link>
            </Button>
      )
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
