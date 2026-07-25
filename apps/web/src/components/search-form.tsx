'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarInput } from '@/components/ui/sidebar';

export function SearchForm({ onSearch }: { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.(query);
      }}
      className="px-2"
    >
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <SidebarInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search portal..."
            className="pl-8 text-xs bg-slate-50 border-slate-200"
          />
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
