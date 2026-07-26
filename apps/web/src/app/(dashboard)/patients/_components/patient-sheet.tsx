'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient, Doctor } from '@doctor-tracker/shared-types';
import { usePatients } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import DoctorCombobox from '@/components/shared/doctor-combobox';
import PatientCombobox from '@/components/shared/patient-combobox';
import DatePicker from '@/components/shared/date-picker';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, UserCheck, Heart, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const patientFormSchema = z.object({
  doctorId: z.string().min(1, 'Attending Doctor selection is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().int().min(0).max(120, 'Age must be between 0 and 120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  condition: z.string().min(1, 'Condition is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  notes: z.string().max(500, 'Notes max 500 characters').optional(),
  avatar: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(), // Comma separated in UI
  medicalHistory: z.string().optional(), // Comma separated in UI
});

export type PatientFormDataInput = z.infer<typeof patientFormSchema>;

export interface PatientFormData extends Omit<PatientFormDataInput, 'allergies' | 'medicalHistory'> {
  allergies?: string[];
  medicalHistory?: string[];
}

interface PatientSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onAssignExistingPatient?: (patientId: string, doctorId: string) => Promise<void>;
  initialData?: Patient | null;
  doctors?: Doctor[];
  defaultDoctorId?: string;
  isLoading?: boolean;
  showToggleMode?: boolean;
}

export default function PatientSheet({
  isOpen,
  onClose,
  onSubmit,
  onAssignExistingPatient,
  initialData,
  doctors = [],
  defaultDoctorId,
  isLoading = false,
  showToggleMode = false,
}: PatientSheetProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>(
    showToggleMode && !initialData ? 'existing' : 'new'
  );
  const [selectedExistingPatientId, setSelectedExistingPatientId] = useState<string>('');

  // Fetch all patients for existing patient selection
  const { data: allPatientsRes } = usePatients({ limit: 1000 });
  const allPatients = allPatientsRes?.data || [];

  // Fetch all doctors if not provided by parent
  const { data: allDoctorsRes } = useDoctors({ limit: 1000 });
  const availableDoctors = doctors.length > 0 ? doctors : (allDoctorsRes?.data || []);

  // Filter out patients who are already assigned to defaultDoctorId
  const unassignedPatients = allPatients.filter((p) => {
    if (!defaultDoctorId) return true;
    const assignedDocId = typeof p.doctorId === 'object' && p.doctorId ? p.doctorId._id : p.doctorId;
    return assignedDocId !== defaultDoctorId;
  });

  const selectedPatientObj = allPatients.find((p) => p._id === selectedExistingPatientId);
  const currentDoctorObj = availableDoctors.find((d) => d._id === defaultDoctorId);

  const doctorIdVal =
    defaultDoctorId ||
    (typeof initialData?.doctorId === 'object' ? initialData.doctorId._id : initialData?.doctorId) ||
    '';

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormDataInput>({
    resolver: zodResolver(patientFormSchema),
    values: {
      doctorId: doctorIdVal,
      name: initialData?.name || '',
      age: initialData?.age ?? 30,
      gender: initialData?.gender || 'Male',
      condition: initialData?.condition || '',
      phone: initialData?.phone || '',
      visitDate: initialData?.visitDate
        ? new Date(initialData.visitDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      notes: initialData?.notes || '',
      avatar: initialData?.avatar || '',
      bloodGroup: initialData?.bloodGroup || 'O+',
      emergencyContact: initialData?.emergencyContact || '',
      address: initialData?.address || '',
      allergies: initialData?.allergies ? initialData.allergies.join(', ') : '',
      medicalHistory: initialData?.medicalHistory ? initialData.medicalHistory.join(', ') : '',
    },
  });

  const watchAvatar = watch('avatar');
  const watchName = watch('name');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: PatientFormDataInput) => {
    const formattedData: PatientFormData = {
      ...data,
      allergies: data.allergies
        ? data.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      medicalHistory: data.medicalHistory
        ? data.medicalHistory.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    await onSubmit(formattedData);
  };

  const handleAssignExistingSubmit = async () => {
    if (!selectedExistingPatientId || !defaultDoctorId || !onAssignExistingPatient) return;
    await onAssignExistingPatient(selectedExistingPatientId, defaultDoctorId);
    setSelectedExistingPatientId('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md glass-card flex flex-col justify-between overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {initialData
              ? 'Edit Patient Record'
              : currentDoctorObj
              ? `Add Patient for Dr. ${currentDoctorObj.name}`
              : 'Register New Patient'}
          </SheetTitle>
          <SheetDescription>
            {showToggleMode
              ? 'Choose to assign an existing unassigned patient or register a brand-new patient record.'
              : 'Enter complete clinical records and personal medical history.'}
          </SheetDescription>
        </SheetHeader>

        {/* Optional Toggle Tabs for Existing vs New Patient */}
        {showToggleMode && !initialData && (
          <div className="pt-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="existing" className="gap-2 text-xs">
                  <UserCheck className="h-3.5 w-3.5" /> Existing Patient
                </TabsTrigger>
                <TabsTrigger value="new" className="gap-2 text-xs">
                  <UserPlus className="h-3.5 w-3.5" /> New Patient
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {activeTab === 'existing' && showToggleMode && !initialData ? (
          /* Existing Patient Selection Mode */
          <div className="space-y-4 my-6 flex-1">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Search & Select Unassigned Patient *
              </label>
              <PatientCombobox
                patients={unassignedPatients}
                value={selectedExistingPatientId}
                onChange={setSelectedExistingPatientId}
                placeholder="Search patient by name or condition..."
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Only showing patients currently not assigned to Dr. {currentDoctorObj?.name || 'this doctor'}.
              </p>
            </div>

            {/* Selected Patient Preview Card */}
            {selectedPatientObj && (
              <div className="glass-card p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center gap-3">
                  <AvatarWithFallback
                    src={selectedPatientObj.avatar}
                    name={selectedPatientObj.name}
                    className="w-10 h-10 border border-primary/20"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{selectedPatientObj.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedPatientObj.age} yrs • {selectedPatientObj.gender}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <Badge variant="outline" className="text-[10px]">
                    <Heart className="h-3 w-3 mr-1 text-rose-500 fill-rose-500" />
                    {selectedPatientObj.condition}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {selectedPatientObj.phone}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* New Patient Registration / Edit Form Mode */
          <form id="patient-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 my-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group cursor-pointer">
                <AvatarWithFallback
                  src={watchAvatar}
                  name={watchName || 'Patient'}
                  className="w-20 h-20 border-2 border-primary/20 text-xl font-bold"
                />
                <label
                  htmlFor="patient-avatar"
                  className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium"
                >
                  Upload
                </label>
                <input
                  id="patient-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <span className="text-[11px] text-muted-foreground">Click photo to update avatar</span>
            </div>

            {/* Attending Doctor Combobox */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Attending Doctor *</label>
              {defaultDoctorId ? (
                <div className="px-3 py-2 text-xs font-semibold border border-border rounded-md bg-muted/30 text-foreground flex items-center justify-between">
                  <span>
                    {currentDoctorObj ? `Dr. ${currentDoctorObj.name} (${currentDoctorObj.specialization})` : 'Assigned Doctor'}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Auto-Selected</Badge>
                </div>
              ) : (
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <DoctorCombobox
                      doctors={availableDoctors}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select doctor..."
                    />
                  )}
                />
              )}
              {errors.doctorId && <p className="text-xs text-destructive mt-1">{errors.doctorId.message}</p>}
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Patient name"
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone *</label>
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="+1 555-0192"
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Age, Gender & Blood Group */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Age *</label>
                <input
                  type="number"
                  {...register('age')}
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.age && <p className="text-xs text-destructive mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Gender *</label>
                <select
                  {...register('gender')}
                  className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Blood Group</label>
                <select
                  {...register('bloodGroup')}
                  className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition & Visit Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Condition / Diagnosis *</label>
                <input
                  type="text"
                  {...register('condition')}
                  placeholder="e.g. Hypertension"
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.condition && <p className="text-xs text-destructive mt-1">{errors.condition.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Visit Date *</label>
                <Controller
                  name="visitDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} placeholder="Visit date" />
                  )}
                />
              </div>
            </div>

            {/* Emergency Contact & Address */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Emergency Contact</label>
              <input
                type="text"
                {...register('emergencyContact')}
                placeholder="+1 555-0911 (Relative)"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Home Address</label>
              <input
                type="text"
                {...register('address')}
                placeholder="Full address"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Allergies & Medical History (Comma separated) */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Known Allergies (Comma-separated)</label>
              <input
                type="text"
                {...register('allergies')}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Surgical / Medical History (Comma-separated)</label>
              <input
                type="text"
                {...register('medicalHistory')}
                placeholder="e.g. Appendectomy (2018), Knee Surgery (2021)"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Clinical Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Patient symptoms & observation..."
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
        )}

        <SheetFooter className="pt-4 border-t border-border/40 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          {activeTab === 'existing' && showToggleMode && !initialData ? (
            <Button
              size="sm"
              disabled={!selectedExistingPatientId || isLoading}
              onClick={handleAssignExistingSubmit}
              className="gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign Selected Patient
            </Button>
          ) : (
            <Button type="submit" form="patient-form" size="sm" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData ? 'Save Changes' : 'Register & Assign Patient'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
