'use client';

import { useState, useMemo } from 'react';
import { Patient } from '@doctor-tracker/shared-types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import Fuse from 'fuse.js';
import { ChevronsUpDown, Check, Search, X } from 'lucide-react';

interface PatientComboboxProps {
  patients: Patient[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PatientCombobox({
  patients,
  value,
  onChange,
  placeholder = 'Select an unassigned patient...',
  disabled = false,
}: PatientComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedPatient = patients.find((p) => p._id === value);

  // Initialize Fuse.js for fuzzy matching on name, condition, phone
  const fuse = useMemo(() => {
    return new Fuse(patients, {
      keys: ['name', 'condition', 'phone'],
      threshold: 0.4,
      distance: 100,
    });
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    return fuse.search(search).map((result) => result.item);
  }, [search, patients, fuse]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-between text-left font-normal border-border bg-background hover:bg-accent hover:text-accent-foreground text-xs h-10"
        >
          <div className="flex items-center gap-2.5 truncate">
            {selectedPatient ? (
              <>
                <AvatarWithFallback src={selectedPatient.avatar} name={selectedPatient.name} className="w-5 h-5" />
                <span className="font-semibold text-foreground truncate">
                  {selectedPatient.name} ({selectedPatient.age} yrs • {selectedPatient.condition})
                </span>
              </>
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
          </div>
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

      <PopoverContent align="start" className="w-80 p-2 glass-card space-y-2 z-50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name or condition..."
            className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-border/40 text-xs">
          {filteredPatients.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">No unassigned patients found</div>
          ) : (
            filteredPatients.map((p) => {
              const isSelected = p._id === value;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    onChange(p._id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left p-2.5 rounded-md flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <AvatarWithFallback src={p.avatar} name={p.name} className="w-7 h-7" />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-foreground truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {p.age} yrs • {p.gender} • {p.condition}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-1" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
