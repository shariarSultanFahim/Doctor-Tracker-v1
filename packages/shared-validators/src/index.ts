import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Doctor Schemas
export const createDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(1, 'Specialization is required'),
  hospital: z.string().min(1, 'Hospital is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const doctorFormSchema = createDoctorSchema;

export type DoctorFormData = z.infer<typeof doctorFormSchema>;

// Patient Schemas
export const createPatientSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
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
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const patientFormSchema = createPatientSchema;

export type PatientFormDataInput = z.infer<typeof patientFormSchema>;

export interface PatientFormData extends Omit<PatientFormDataInput, 'allergies' | 'medicalHistory'> {
  allergies?: string[];
  medicalHistory?: string[];
}

// User / Profile Schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  tablePreferences: z
    .object({
      doctors: z.record(z.boolean()).optional(),
      patients: z.record(z.boolean()).optional(),
    })
    .optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const profileInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
