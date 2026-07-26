'use client';

import { useState, useMemo } from 'react';
import { useDoctors } from '@/hooks/use-doctors';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, Search, X } from 'lucide-react';
import Fuse from 'fuse.js';

interface SpecializationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SpecializationCombobox({
  value,
  onChange,
  placeholder = 'All Specializations',
  disabled = false,
}: SpecializationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all doctors to get all unique specializations
  const { data } = useDoctors({ limit: 1000 });

  const specializations = useMemo(() => {
    const docs = data?.data || [];
    const specs = docs.map((d) => d.specialization);
    return Array.from(new Set(specs)).filter(Boolean).sort();
  }, [data]);

  // Initialize Fuse.js for fuzzy matching
  const fuse = useMemo(() => {
    return new Fuse(specializations, {
      threshold: 0.4,
      distance: 10,
    });
  }, [specializations]);

  const filteredSpecs = useMemo(() => {
    if (!search.trim()) return specializations;
    const results = fuse.search(search);
    return results.map((result) => result.item);
  }, [search, specializations, fuse]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full md:w-56 justify-between text-left font-normal border-border bg-background hover:bg-accent hover:text-accent-foreground text-xs h-9"
        >
          <span className={value ? 'font-medium text-foreground truncate' : 'text-muted-foreground truncate'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {value && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-2 glass-card space-y-2 z-50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specialization..."
            className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-border/40 text-xs">
          {filteredSpecs.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">No specializations found</div>
          ) : (
            filteredSpecs.map((spec) => {
              const isSelected = spec === value;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    onChange(spec);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left p-2 rounded-md flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="truncate">{spec}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
