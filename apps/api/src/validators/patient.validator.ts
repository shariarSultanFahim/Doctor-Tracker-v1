import { z } from 'zod';

export const createPatientSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(0).max(120, 'Age must be between 0 and 120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  condition: z.string().min(1, 'Condition is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  visitDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format')),
  notes: z.string().max(500, 'Notes max 500 characters').optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
