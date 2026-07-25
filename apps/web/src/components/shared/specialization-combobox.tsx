'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useDoctors } from '@/hooks/use-doctors';
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full md:w-56">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed text-left"
      >
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-500'}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg p-2 space-y-2 animate-in fade-in-50 duration-150">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specialization..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 text-xs">
            {filteredSpecs.length === 0 ? (
              <div className="p-3 text-center text-slate-400">No specializations found</div>
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
                      isSelected ? 'bg-sky-50 text-sky-700 font-medium' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span>{spec}</span>
                    {isSelected && <Check className="h-4 w-4 text-sky-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
