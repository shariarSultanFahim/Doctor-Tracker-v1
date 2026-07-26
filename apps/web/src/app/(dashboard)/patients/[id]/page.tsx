'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import PatientSheet, { PatientFormData } from '../_components/patient-sheet';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import ConfirmDeleteDialog from '@/components/shared/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  User,
  Calendar,
  Phone,
  Heart,
  FileText,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Building,
  ShieldAlert,
  Activity,
  MapPin,
  AlertTriangle,
  History,
} from 'lucide-react';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: patientRes, isLoading: isPatientLoading } = usePatient(id);
  const { data: doctorsRes } = useDoctors({ limit: 1000 });

  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const patient = patientRes?.data;
  const doctors = doctorsRes?.data || [];

  const handleEditSubmit = async (formData: PatientFormData) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      toast.success('Patient record updated successfully');
      setIsSheetOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Patient record deleted successfully');
      router.push('/patients');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  if (isPatientLoading) {
    return (
      <div className="py-24 text-center text-muted-foreground glass-card">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
        Loading patient clinical records...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 py-12 text-center text-muted-foreground glass-card">
        <div>Patient record not found.</div>
        <Button asChild variant="outline">
          <Link href="/patients" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Patients Roster
          </Link>
        </Button>
      </div>
    );
  }

  const doctorVal = patient.doctorId;
  const attendingDoctor = typeof doctorVal === 'object' ? doctorVal : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patients Roster
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(true)} className="gap-2 text-xs">
            <Edit2 className="h-3.5 w-3.5" />
            Edit Record
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirm(true)}
            className="gap-2 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Patient
          </Button>
        </div>
      </div>

      {/* Patient Main Summary Banner Card */}
      <div className="glass-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <AvatarWithFallback
            src={patient.avatar}
            name={patient.name}
            className="w-20 h-20 text-2xl font-bold border-2 border-primary/20 shadow-md"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
              {patient.bloodGroup && (
                <Badge variant="destructive" className="font-extrabold text-xs">
                  Blood: {patient.bloodGroup}
                </Badge>
              )}
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              {patient.age} years old • {patient.gender}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              {patient.condition}
            </div>
          </div>
        </div>

        {/* Attending Doctor Quick Summary Card */}
        {attendingDoctor && (
          <div className="glass-card p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-4 self-stretch md:self-auto">
            <AvatarWithFallback src={attendingDoctor.avatar} name={attendingDoctor.name} className="w-12 h-12" />
            <div className="text-xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Attending Specialist
              </span>
              <Link href={`/doctors/${attendingDoctor._id}`} className="font-bold text-foreground hover:underline">
                Dr. {attendingDoctor.name}
              </Link>
              <p className="text-muted-foreground">{attendingDoctor.specialization}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Medical & Personal Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Personal Details Card */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <User className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Contact & Identity</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" /> Primary Contact:
              </span>
              <span className="font-semibold text-foreground">{patient.phone}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-border/30">
              <span className="text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Emergency Contact:
              </span>
              <span className="font-semibold text-foreground">{patient.emergencyContact || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-border/30">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Home Address:
              </span>
              <span className="font-medium text-foreground">{patient.address || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-border/30">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Last Consultation:
              </span>
              <span className="font-semibold text-foreground">{new Date(patient.visitDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Known Allergies Card */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Allergies & Contraindications</h3>
          </div>
          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {patient.allergies.map((allergy, i) => (
                <Badge key={i} variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs py-1 px-2.5">
                  ⚠️ {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No known drug or environmental allergies recorded.</p>
          )}
        </div>

        {/* Medical / Surgical History Timeline Card */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Surgical & Medical History</h3>
          </div>
          {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {patient.medicalHistory.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 text-xs">
                  <Activity className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No prior surgical or medical hospitalizations logged.</p>
          )}
        </div>

        {/* Clinical Observations & Notes Card */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Clinical Observations & Doctor Notes</h3>
          </div>
          <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/40">
            {patient.notes || 'No detailed clinical notes added for this patient consultation.'}
          </p>
        </div>
      </div>

      {/* Edit Patient Sheet */}
      <PatientSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={patient}
        doctors={doctors}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Patient Record"
        description={`Are you sure you want to delete ${patient.name}'s medical file? This action is permanent and cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
