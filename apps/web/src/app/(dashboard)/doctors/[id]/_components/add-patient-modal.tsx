'use client';

import { useState } from 'react';
import { usePatients, useUpdatePatient } from '@/hooks/use-patients';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  onAddNewClick: () => void;
}

export default function AddPatientModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  onAddNewClick,
}: AddPatientModalProps) {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patientsRes, isLoading } = usePatients({ search, limit: 50 });
  const updatePatientMutation = useUpdatePatient();

  const patients = patientsRes?.data || [];

  const handleAssignPatient = async () => {
    if (!selectedPatientId) return;
    try {
      await updatePatientMutation.mutateAsync({
        id: selectedPatientId,
        data: { doctorId },
      });
      toast.success(`Patient assigned to ${doctorName}`);
      setSelectedPatientId(null);
      onClose();
    } catch (err: any) {
      toast.error('Failed to assign patient');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Add Patient to Roster</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search for an existing patient to assign under Dr. {doctorName}, or create a new patient record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search existing patients by name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Search Results List */}
          <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2 bg-background/50">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-primary" />
                Searching system records...
              </div>
            ) : patients.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No patients match "{search}".
              </div>
            ) : (
              patients.map((patient) => {
                const isSelected = selectedPatientId === patient._id;
                const isAlreadyAssigned =
                  typeof patient.doctorId === 'object'
                    ? patient.doctorId._id === doctorId
                    : patient.doctorId === doctorId;

                return (
                  <div
                    key={patient._id}
                    onClick={() => !isAlreadyAssigned && setSelectedPatientId(patient._id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isAlreadyAssigned
                        ? 'opacity-50 cursor-not-allowed border-border/40 bg-muted/20'
                        : isSelected
                        ? 'border-primary bg-primary/10 cursor-pointer'
                        : 'border-border/60 hover:bg-muted/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AvatarWithFallback src={patient.avatar} name={patient.name} className="w-8 h-8" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">{patient.name}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {patient.condition}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {patient.age} yrs • {patient.gender}
                        </span>
                      </div>
                    </div>

                    {isAlreadyAssigned ? (
                      <span className="text-[10px] text-muted-foreground font-medium">Assigned</span>
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onAddNewClick();
            }}
            className="w-full sm:w-auto gap-1.5 text-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            + Create New Patient
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedPatientId || updatePatientMutation.isPending}
              onClick={handleAssignPatient}
              className="text-xs gap-1.5"
            >
              {updatePatientMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Assign Patient
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
