'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useDebounce } from 'use-debounce';
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from '@/hooks/use-doctors';
import { useAuth } from '@/hooks/use-auth';
import { Doctor } from '@doctor-tracker/shared-types';
import DoctorSheet, { DoctorFormData } from './_components/doctor-sheet';
import SpecializationCombobox from '@/components/shared/specialization-combobox';
import DataTable, { ColumnDef } from '@/components/shared/data-table/data-table';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import ConfirmDeleteDialog from '@/components/shared/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

export default function DoctorsPage() {
  // NUQS URL Search Params State
  const [searchParam, setSearchParam] = useQueryState('search', parseAsString.withDefault(''));
  const [specializationParam, setSpecializationParam] = useQueryState('specialization', parseAsString.withDefault(''));
  const [pageParam, setPageParam] = useQueryState('page', parseAsInteger.withDefault(1));

  // Local input state for smooth typing before debounce
  const [searchInputValue, setSearchInputValue] = useState(searchParam);
  const [specializationInputValue, setSpecializationInputValue] = useState(specializationParam);

  // Debounced search terms (300ms delay)
  const [debouncedSearch] = useDebounce(searchInputValue, 300);
  const [debouncedSpecialization] = useDebounce(specializationInputValue, 300);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);

  const { user, updateProfile } = useAuth();

  // Fetch doctors with debounced terms & NUQS state
  const { data, isLoading } = useDoctors({
    search: debouncedSearch,
    specialization: debouncedSpecialization,
    page: pageParam,
    limit: 10,
  });

  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleSearchChange = (val: string) => {
    setSearchInputValue(val);
    setSearchParam(val || null);
    setPageParam(1);
  };

  const handleSpecializationChange = (val: string) => {
    setSpecializationInputValue(val);
    setSpecializationParam(val || null);
    setPageParam(1);
  };

  const handleClearFilters = () => {
    setSearchInputValue('');
    setSpecializationInputValue('');
    setSearchParam(null);
    setSpecializationParam(null);
    setPageParam(1);
  };

  const handleCreateOrUpdate = async (formData: DoctorFormData) => {
    try {
      if (selectedDoctor) {
        await updateMutation.mutateAsync({ id: selectedDoctor._id, data: formData });
        toast.success('Doctor record updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('New doctor profile created');
      }
      setIsSheetOpen(false);
      setSelectedDoctor(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDoctorId) return;
    try {
      await deleteMutation.mutateAsync(deleteDoctorId);
      toast.success('Doctor deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeleteDoctorId(null);
    }
  };

  const handleInlineEdit = async (doctor: string, field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({ id: doctor, data: { [field]: value } });
      toast.success('Doctor updated');
    } catch (err: any) {
      toast.error('Failed to update field');
    }
  };

  const handleColumnPreferencesChange = (newPrefs: Record<string, boolean>) => {
    const updatedTablePrefs = {
      ...(user?.tablePreferences || {}),
      doctors: newPrefs,
    };
    updateProfile.mutate({ tablePreferences: updatedTablePrefs });
  };

  const doctors = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const columns: ColumnDef<Doctor>[] = [
    {
      id: 'name',
      header: 'Doctor Name',
      accessorKey: 'name',
      editable: true,
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <AvatarWithFallback src={doc.avatar} name={doc.name} className="w-8 h-8" />
          <Link
            href={`/doctors/${doc._id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {doc.name}
          </Link>
        </div>
      ),
    },
    {
      id: 'specialization',
      header: 'Specialization',
      accessorKey: 'specialization',
      editable: true,
      cell: (doc) => (
        <Badge variant="outline" className="font-normal text-xs bg-muted/30">
          {doc.specialization}
        </Badge>
      ),
    },
    {
      id: 'hospital',
      header: 'Hospital',
      accessorKey: 'hospital',
      editable: true,
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      editable: true,
    },
    {
      id: 'patientCount',
      header: 'Patients',
      cell: (doc) => (
        <span className="font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-full text-xs">
          {doc.patientCount || 0}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Added On',
      cell: (doc) => new Date(doc.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/doctors/${doc._id}`}>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedDoctor(doc);
              setIsSheetOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteDoctorId(doc._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Doctors Directory</h1>
          <p className="text-sm text-muted-foreground">Manage medical specialists with deep filtering & inline editing</p>
        </div>
        <Button
          onClick={() => {
            setSelectedDoctor(null);
            setIsSheetOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <SpecializationCombobox
            value={specializationInputValue}
            onChange={handleSpecializationChange}
          />
          {(searchInputValue || specializationInputValue) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={doctors}
        columns={columns}
        columnPreferences={user?.tablePreferences?.doctors}
        onColumnPreferencesChange={handleColumnPreferencesChange}
        onInlineEdit={handleInlineEdit}
        isLoading={isLoading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPageParam(p),
        }}
        renderMobileCard={(doc) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarWithFallback src={doc.avatar} name={doc.name} className="w-10 h-10" />
                <div>
                  <Link href={`/doctors/${doc._id}`} className="font-semibold text-foreground hover:underline">
                    {doc.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{doc.hospital}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{doc.specialization}</Badge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">Patients: {doc.patientCount || 0}</span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
                  <Link href={`/doctors/${doc._id}`}>View</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setIsSheetOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-destructive"
                  onClick={() => setDeleteDoctorId(doc._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Reusable Doctor Sheet Form */}
      <DoctorSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedDoctor(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedDoctor || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Reusable Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteDoctorId}
        onClose={() => setDeleteDoctorId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Doctor Profile"
        description="Are you sure you want to delete this doctor? All patient assignments and doctor records will be permanently removed."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
