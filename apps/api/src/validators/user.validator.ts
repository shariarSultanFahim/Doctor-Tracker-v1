import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  tablePreferences: z.object({
    doctors: z.record(z.boolean()).optional(),
    patients: z.record(z.boolean()).optional(),
  }).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});
