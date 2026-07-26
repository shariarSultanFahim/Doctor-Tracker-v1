'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useDebounce } from 'use-debounce';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import { useAuth } from '@/hooks/use-auth';
import { Patient } from '@doctor-tracker/shared-types';
import PatientSheet, { PatientFormData } from './_components/patient-sheet';
import DoctorCombobox from '@/components/shared/doctor-combobox';
import DataTable, { ColumnDef } from '@/components/shared/data-table/data-table';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import ConfirmDeleteDialog from '@/components/shared/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

function PatientsPageContent() {
  // NUQS State
  const [searchParam, setSearchParam] = useQueryState('search', parseAsString.withDefault(''));
  const [conditionParam, setConditionParam] = useQueryState('condition', parseAsString.withDefault(''));
  const [doctorIdParam, setDoctorIdParam] = useQueryState('doctorId', parseAsString.withDefault(''));
  const [pageParam, setPageParam] = useQueryState('page', parseAsInteger.withDefault(1));

  // Local input state for smooth debounced search & condition
  const [searchInputValue, setSearchInputValue] = useState(searchParam);
  const [conditionInputValue, setConditionInputValue] = useState(conditionParam);

  const [debouncedSearch] = useDebounce(searchInputValue, 300);
  const [debouncedCondition] = useDebounce(conditionInputValue, 300);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  const { user, updateProfile } = useAuth();

  const { data: patientsRes, isLoading } = usePatients({
    search: debouncedSearch,
    condition: debouncedCondition,
    doctorId: doctorIdParam,
    page: pageParam,
    limit: 10,
  });
  const { data: doctorsRes } = useDoctors({ limit: 100 });

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const patients = patientsRes?.data || [];
  const doctors = doctorsRes?.data || [];
  const pagination = patientsRes?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const handleSearchChange = (val: string) => {
    setSearchInputValue(val);
    setSearchParam(val || null);
    setPageParam(1);
  };

  const handleConditionChange = (val: string) => {
    setConditionInputValue(val);
    setConditionParam(val || null);
    setPageParam(1);
  };

  const handleDoctorChange = (val: string) => {
    setDoctorIdParam(val || null);
    setPageParam(1);
  };

  const handleClearFilters = () => {
    setSearchInputValue('');
    setConditionInputValue('');
    setSearchParam(null);
    setConditionParam(null);
    setDoctorIdParam(null);
    setPageParam(1);
  };

  const handleCreateOrUpdate = async (formData: PatientFormData) => {
    try {
      if (selectedPatient) {
        await updateMutation.mutateAsync({ id: selectedPatient._id, data: formData });
        toast.success('Patient record updated');
      } else {
        await createMutation.mutateAsync({ doctorId: formData.doctorId, data: formData });
        toast.success('Patient record created');
      }
      setIsSheetOpen(false);
      setSelectedPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePatientId) return;
    try {
      await deleteMutation.mutateAsync(deletePatientId);
      toast.success('Patient record deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeletePatientId(null);
    }
  };

  const handleInlineEdit = async (patientId: string, field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({ id: patientId, data: { [field]: value } });
      toast.success('Patient updated');
    } catch (err: any) {
      toast.error('Failed to update field');
    }
  };

  const handleColumnPreferencesChange = (newPrefs: Record<string, boolean>) => {
    const updatedTablePrefs = {
      ...(user?.tablePreferences || {}),
      patients: newPrefs,
    };
    updateProfile.mutate({ tablePreferences: updatedTablePrefs });
  };

  const columns: ColumnDef<Patient>[] = [
    {
      id: 'name',
      header: 'Patient Name',
      accessorKey: 'name',
      editable: true,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <AvatarWithFallback src={p.avatar} name={p.name} className="w-8 h-8" />
          <Link href={`/patients/${p._id}`} className="font-medium text-foreground hover:text-primary hover:underline">
            {p.name}
          </Link>
        </div>
      ),
    },
    {
      id: 'age',
      header: 'Age / Gender',
      editable: true,
      accessorKey: 'age',
      editType: 'number',
      cell: (p) => (
        <span>
          {p.age} yrs • <span className="text-muted-foreground">{p.gender}</span>
        </span>
      ),
    },
    {
      id: 'condition',
      header: 'Condition',
      accessorKey: 'condition',
      editable: true,
      cell: (p) => (
        <Badge variant="outline" className="font-normal text-xs bg-muted/30">
          {p.condition}
        </Badge>
      ),
    },
    {
      id: 'doctor',
      header: 'Attending Doctor',
      cell: (p) => {
        const doctorName = typeof p.doctorId === 'object' && p.doctorId ? p.doctorId.name : (p.doctorName || 'Unassigned');
        return <span className="text-muted-foreground font-medium">{doctorName}</span>;
      },
    },
    {
      id: 'phone',
      header: 'Contact',
      accessorKey: 'phone',
      editable: true,
    },
    {
      id: 'visitDate',
      header: 'Visit Date',
      cell: (p) => new Date(p.visitDate).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/patients/${p._id}`}>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedPatient(p);
              setIsSheetOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeletePatientId(p._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Patients Directory</h1>
          <p className="text-sm text-muted-foreground">Manage patient records with double-click inline editing & column toggles</p>
        </div>
        <Button
          onClick={() => {
            setSelectedPatient(null);
            setIsSheetOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search patient name..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={conditionInputValue}
            onChange={(e) => handleConditionChange(e.target.value)}
            placeholder="Filter by condition..."
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="w-full sm:w-64">
            <DoctorCombobox
              doctors={doctors}
              value={doctorIdParam}
              onChange={handleDoctorChange}
              placeholder="Filter by doctor..."
            />
          </div>
          {(searchInputValue || conditionInputValue || doctorIdParam) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={patients}
        columns={columns}
        columnPreferences={user?.tablePreferences?.patients}
        onColumnPreferencesChange={handleColumnPreferencesChange}
        onInlineEdit={handleInlineEdit}
        isLoading={isLoading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPageParam(p),
        }}
        renderMobileCard={(p) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarWithFallback src={p.avatar} name={p.name} className="w-10 h-10" />
                <div>
                  <Link href={`/patients/${p._id}`} className="font-semibold text-foreground hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.age} yrs • {p.gender}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{p.condition}</Badge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">
                Doctor: {typeof p.doctorId === 'object' && p.doctorId ? p.doctorId.name : (p.doctorName || 'Unassigned')}
              </span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
                  <Link href={`/patients/${p._id}`}>View</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setSelectedPatient(p);
                    setIsSheetOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-destructive"
                  onClick={() => setDeletePatientId(p._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Reusable Patient Form Sheet */}
      <PatientSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedPatient || undefined}
        doctors={doctors}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Reusable Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deletePatientId}
        onClose={() => setDeletePatientId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Patient Record"
        description="Are you sure you want to delete this patient record? Clinical history and assignments will be removed."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading patients...</div>}>
      <PatientsPageContent />
    </Suspense>
  );
}
