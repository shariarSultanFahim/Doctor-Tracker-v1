'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Columns3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  editable?: boolean;
  editType?: 'text' | 'number' | 'select';
  selectOptions?: { label: string; value: string }[];
  className?: string;
  defaultVisible?: boolean;
}

interface DataTableProps<T extends { _id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  columnPreferences?: Record<string, boolean>;
  onColumnPreferencesChange?: (prefs: Record<string, boolean>) => void;
  onInlineEdit?: (id: string, field: string, value: any) => Promise<void>;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  emptyMessage?: string;
  renderMobileCard?: (item: T, actions?: React.ReactNode) => React.ReactNode;
}

export default function DataTable<T extends { _id: string }>({
  data,
  columns,
  columnPreferences,
  onColumnPreferencesChange,
  onInlineEdit,
  pagination,
  isLoading = false,
  emptyMessage = 'No records found.',
  renderMobileCard,
}: DataTableProps<T>) {
  // Initialize column visibility state from preferences or column defaultVisible
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      if (columnPreferences && columnPreferences[col.id] !== undefined) {
        initial[col.id] = columnPreferences[col.id];
      } else {
        initial[col.id] = col.defaultVisible !== false;
      }
    });
    return initial;
  });

  useEffect(() => {
    if (columnPreferences) {
      setVisibleColumns((prev) => ({
        ...prev,
        ...columnPreferences,
      }));
    }
  }, [columnPreferences]);

  const toggleColumn = (colId: string) => {
    const newPrefs = {
      ...visibleColumns,
      [colId]: !visibleColumns[colId],
    };
    setVisibleColumns(newPrefs);
    if (onColumnPreferencesChange) {
      onColumnPreferencesChange(newPrefs);
    }
  };

  // Inline editing state: { rowId, colId, value }
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    colId: string;
    field: string;
    value: any;
  } | null>(null);
  const [isSavingInline, setIsSavingInline] = useState(false);

  const startInlineEdit = (item: T, col: ColumnDef<T>) => {
    if (!col.editable || !col.accessorKey) return;
    setEditingCell({
      rowId: item._id,
      colId: col.id,
      field: col.accessorKey as string,
      value: item[col.accessorKey],
    });
  };

  const cancelInlineEdit = () => {
    setEditingCell(null);
  };

  const saveInlineEdit = async () => {
    if (!editingCell || !onInlineEdit) return;
    try {
      setIsSavingInline(true);
      await onInlineEdit(editingCell.rowId, editingCell.field, editingCell.value);
    } finally {
      setIsSavingInline(false);
      setEditingCell(null);
    }
  };

  const activeColumns = columns.filter((col) => visibleColumns[col.id] !== false);

  return (
    <div className="space-y-4">
      {/* Table Toolbar / Controls */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="text-xs text-muted-foreground">
          Double-click any editable cell to edit directly.
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Columns3 className="h-3.5 w-3.5" />
              <span>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-card">
            <DropdownMenuLabel className="text-xs">Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={visibleColumns[col.id] !== false}
                onCheckedChange={() => toggleColumn(col.id)}
                className="text-xs capitalize"
              >
                {col.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {activeColumns.map((col) => (
                  <th key={col.id} className={cn('py-3.5 px-4', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={activeColumns.length} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length} className="py-12 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/40 transition-colors">
                    {activeColumns.map((col) => {
                      const isEditing =
                        editingCell?.rowId === item._id && editingCell?.colId === col.id;

                      return (
                        <td
                          key={col.id}
                          onDoubleClick={() => startInlineEdit(item, col)}
                          title={col.editable ? 'Double-click to edit' : undefined}
                          className={cn(
                            'py-3 px-4 transition-colors',
                            col.editable && 'cursor-pointer hover:bg-accent/30',
                            col.className
                          )}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {col.editType === 'select' ? (
                                <select
                                  value={editingCell.value}
                                  onChange={(e) =>
                                    setEditingCell((prev) => prev && { ...prev, value: e.target.value })
                                  }
                                  className="px-2 py-1 text-xs border border-primary rounded bg-background text-foreground focus:outline-none"
                                  autoFocus
                                >
                                  {col.selectOptions?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={col.editType || 'text'}
                                  value={editingCell.value}
                                  onChange={(e) =>
                                    setEditingCell(
                                      (prev) =>
                                        prev && {
                                          ...prev,
                                          value:
                                            col.editType === 'number'
                                              ? Number(e.target.value)
                                              : e.target.value,
                                        }
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveInlineEdit();
                                    if (e.key === 'Escape') cancelInlineEdit();
                                  }}
                                  className="px-2 py-1 text-xs border border-primary rounded bg-background text-foreground focus:outline-none w-full max-w-[140px]"
                                  autoFocus
                                />
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-green-600 hover:text-green-700"
                                onClick={saveInlineEdit}
                                disabled={isSavingInline}
                              >
                                {isSavingInline ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive"
                                onClick={cancelInlineEdit}
                                disabled={isSavingInline}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : col.cell ? (
                            col.cell(item)
                          ) : col.accessorKey ? (
                            String(item[col.accessorKey] ?? '')
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Card List View */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground glass-card p-6">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading data...
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground glass-card p-6">
            {emptyMessage}
          </div>
        ) : (
          data.map((item) => (
            <div key={item._id} className="glass-card p-4 space-y-3 rounded-xl border border-border">
              {renderMobileCard ? (
                renderMobileCard(item)
              ) : (
                <div className="space-y-2 text-sm">
                  {activeColumns.map((col) => (
                    <div key={col.id} className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                      <span className="text-xs font-semibold text-muted-foreground">{col.header}</span>
                      <span>{col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] ?? '')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Server Side Pagination Footer */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-2 pt-2">
          <div>
            Showing Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.total} total items)
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
