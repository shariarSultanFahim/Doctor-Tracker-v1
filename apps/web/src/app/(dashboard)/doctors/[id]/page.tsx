'use client';

import { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useDebounce } from 'use-debounce';
import { useDoctor, useUpdateDoctor, useDeleteDoctor } from '@/hooks/use-doctors';
import { useDoctorPatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { Patient } from '@doctor-tracker/shared-types';
import PatientSheet, { PatientFormData } from '../../patients/_components/patient-sheet';
import DoctorSheet, { DoctorFormData } from '../../doctors/_components/doctor-sheet';
import ConfirmDeleteDialog from '@/components/shared/confirm-delete-dialog';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import DataTable, { ColumnDef } from '@/components/shared/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, ArrowLeft, Eye, Mail, Phone, Building, UserCheck } from 'lucide-react';

function DoctorDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // NUQS State
  const [searchParam, setSearchParam] = useQueryState('search', parseAsString.withDefault(''));
  const [pageParam, setPageParam] = useQueryState('page', parseAsInteger.withDefault(1));

  // Local input state for debounced search
  const [searchInputValue, setSearchInputValue] = useState(searchParam);
  const [debouncedSearch] = useDebounce(searchInputValue, 300);

  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);
  const [isDoctorSheetOpen, setIsDoctorSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [deleteDoctorConfirm, setDeleteDoctorConfirm] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  const { data: doctorRes, isLoading: isDoctorLoading } = useDoctor(id);
  const { data: patientsRes, isLoading: isPatientsLoading } = useDoctorPatients(id, {
    search: debouncedSearch,
    page: pageParam,
    limit: 10,
  });

  const updateDoctorMutation = useUpdateDoctor();
  const deleteDoctorMutation = useDeleteDoctor();
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  const doctor = doctorRes?.data;
  const patients = patientsRes?.data || [];
  const pagination = patientsRes?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const handleSearchChange = (val: string) => {
    setSearchInputValue(val);
    setSearchParam(val || null);
    setPageParam(1);
  };

  const handleDoctorEditSubmit = async (formData: DoctorFormData) => {
    try {
      await updateDoctorMutation.mutateAsync({ id, data: formData });
      toast.success('Doctor profile updated successfully');
      setIsDoctorSheetOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDoctorDelete = async () => {
    try {
      await deleteDoctorMutation.mutateAsync(id);
      toast.success('Doctor profile deleted successfully');
      router.push('/doctors');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleCreateOrUpdatePatient = async (formData: PatientFormData) => {
    try {
      if (selectedPatient) {
        await updatePatientMutation.mutateAsync({ id: selectedPatient._id, data: formData });
        toast.success('Patient record updated');
      } else {
        await createPatientMutation.mutateAsync({ doctorId: id, data: { ...formData, doctorId: id } });
        toast.success('Patient added to doctor roster');
      }
      setIsPatientSheetOpen(false);
      setSelectedPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleAssignExistingPatient = async (patientId: string, doctorId: string) => {
    try {
      await updatePatientMutation.mutateAsync({
        id: patientId,
        data: { doctorId },
      });
      toast.success(`Patient assigned to Dr. ${doctor?.name || 'Doctor'}`);
    } catch (err: any) {
      toast.error('Failed to assign patient');
    }
  };

  const handleConfirmDeletePatient = async () => {
    if (!deletePatientId) return;
    try {
      await deletePatientMutation.mutateAsync(deletePatientId);
      toast.success('Patient record deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeletePatientId(null);
    }
  };

  const patientColumns: ColumnDef<Patient>[] = [
    {
      id: 'name',
      header: 'Patient Name',
      accessorKey: 'name',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <AvatarWithFallback src={p.avatar} name={p.name} className="w-8 h-8" />
          <Link href={`/patients/${p._id}`} className="font-medium text-foreground hover:underline">
            {p.name}
          </Link>
        </div>
      ),
    },
    {
      id: 'age',
      header: 'Age / Gender',
      cell: (p) => (
        <span>
          {p.age} yrs • <span className="text-muted-foreground">{p.gender}</span>
        </span>
      ),
    },
    {
      id: 'condition',
      header: 'Condition',
      cell: (p) => <Badge variant="outline">{p.condition}</Badge>,
    },
    {
      id: 'phone',
      header: 'Contact',
      accessorKey: 'phone',
    },
    {
      id: 'visitDate',
      header: 'Last Visit',
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
              setIsPatientSheetOpen(true);
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

  if (isDoctorLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground glass-card">
        Loading doctor profile details...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-20 text-center space-y-4 glass-card">
        <h2 className="text-lg font-bold text-foreground">Doctor Profile Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/doctors" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors Directory
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsDoctorSheetOpen(true)} className="gap-2 text-xs">
            <Edit2 className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDoctorConfirm(true)}
            className="gap-2 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Doctor
          </Button>
        </div>
      </div>

      {/* Doctor Header Banner Card */}
      <div className="glass-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <AvatarWithFallback
            src={doctor.avatar}
            name={doctor.name}
            className="w-20 h-20 text-2xl font-bold border-2 border-primary/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{doctor.name}</h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                {doctor.specialization}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-primary" />
                {doctor.hospital}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {doctor.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {doctor.email}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card px-6 py-4 rounded-xl border border-border bg-muted/20 flex items-center gap-4 self-stretch md:self-auto justify-between">
          <div>
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Patients
            </span>
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {pagination?.total !== undefined ? pagination.total : (doctor.patientCount || 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-primary/10 text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Patients Roster Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Assigned Patients Roster</h2>
            <p className="text-xs text-muted-foreground">Manage and assign patient cases under Dr. {doctor.name}</p>
          </div>
          <Button
            onClick={() => {
              setSelectedPatient(null);
              setIsPatientSheetOpen(true);
            }}
            className="gap-2 text-xs"
          >
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-card p-3 rounded-xl border border-border flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search assigned patients..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {searchInputValue && (
            <Button variant="ghost" size="sm" onClick={() => handleSearchChange('')} className="text-xs">
              Clear
            </Button>
          )}
        </div>

        {/* DataTable for Patients */}
        <DataTable
          data={patients}
          columns={patientColumns}
          isLoading={isPatientsLoading}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total,
            onPageChange: (p) => setPageParam(p),
          }}
          emptyMessage={`No patients assigned under Dr. ${doctor.name}.`}
        />
      </div>

      {/* Edit Doctor Sheet */}
      <DoctorSheet
        isOpen={isDoctorSheetOpen}
        onClose={() => setIsDoctorSheetOpen(false)}
        onSubmit={handleDoctorEditSubmit}
        initialData={doctor}
        isLoading={updateDoctorMutation.isPending}
      />

      {/* Create / Assign Patient Sheet with Existing/New Patient Tabs */}
      <PatientSheet
        isOpen={isPatientSheetOpen}
        onClose={() => {
          setIsPatientSheetOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleCreateOrUpdatePatient}
        onAssignExistingPatient={handleAssignExistingPatient}
        initialData={selectedPatient || undefined}
        doctors={doctor ? [doctor] : []}
        defaultDoctorId={doctor._id}
        showToggleMode={!selectedPatient}
        isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
      />

      {/* Confirm Delete Doctor Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDoctorConfirm}
        onClose={() => setDeleteDoctorConfirm(false)}
        onConfirm={handleDoctorDelete}
        title="Delete Doctor Profile"
        description={`Are you sure you want to delete Dr. ${doctor.name}? Their patient records will remain intact in the system as unassigned.`}
        isLoading={deleteDoctorMutation.isPending}
      />

      {/* Confirm Delete Patient Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deletePatientId}
        onClose={() => setDeletePatientId(null)}
        onConfirm={handleConfirmDeletePatient}
        title="Delete Patient Record"
        description="Are you sure you want to delete this patient record? Clinical history and assignments will be removed."
        isLoading={deletePatientMutation.isPending}
      />
    </div>
  );
}

export default function DoctorDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading doctor details...</div>}>
      <DoctorDetailPageContent {...props} />
    </Suspense>
  );
}
