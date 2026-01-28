'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function SidebarItem({
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
