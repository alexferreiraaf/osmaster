'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';

export function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={18}
      />
      <Input
        type="text"
        placeholder="Buscar..."
        className="pl-10 pr-4 py-2 bg-muted border-none rounded-full text-sm focus:ring-2 focus:ring-ring w-64"
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
