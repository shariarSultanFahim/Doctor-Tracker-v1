'use client';

import { useState, useMemo } from 'react';
import { Doctor } from '@doctor-tracker/shared-types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Fuse from 'fuse.js';
import { ChevronsUpDown, Check, Search, X } from 'lucide-react';

interface DoctorComboboxProps {
  doctors: Doctor[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function DoctorCombobox({
  doctors,
  value,
  onChange,
  placeholder = 'Select a doctor...',
  disabled = false,
}: DoctorComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedDoctor = doctors.find((d) => d._id === value);

  // Initialize Fuse.js for fuzzy matching on name, specialization, and hospital
  const fuse = useMemo(() => {
    return new Fuse(doctors, {
      keys: ['name', 'specialization', 'hospital'],
      threshold: 0.4,
      distance: 100,
    });
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    return fuse.search(search).map((result) => result.item);
  }, [search, doctors, fuse]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-between text-left font-normal border-border bg-background hover:bg-accent hover:text-accent-foreground text-xs h-9"
        >
          <span className={selectedDoctor ? 'font-medium text-foreground truncate' : 'text-muted-foreground truncate'}>
            {selectedDoctor ? `${selectedDoctor.name} (${selectedDoctor.specialization})` : placeholder}
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

      <PopoverContent align="start" className="w-72 p-2 glass-card space-y-2 z-50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Fuzzy search doctor..."
            className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-border/40 text-xs">
          {filteredDoctors.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">No doctors found</div>
          ) : (
            filteredDoctors.map((doc) => {
              const isSelected = doc._id === value;
              return (
                <button
                  key={doc._id}
                  type="button"
                  onClick={() => {
                    onChange(doc._id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left p-2 rounded-md flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-semibold text-foreground truncate">{doc.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {doc.specialization} • {doc.hospital}
                    </div>
                  </div>
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
