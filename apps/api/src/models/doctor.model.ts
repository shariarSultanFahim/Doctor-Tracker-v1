import { Schema, model, Document } from 'mongoose';
import { Doctor as IDoctor } from '@doctor-tracker/shared-types';

export interface DoctorDocument extends Omit<IDoctor, '_id'>, Document {}

const doctorSchema = new Schema<DoctorDocument>(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    hospital: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
doctorSchema.index({ createdAt: -1 });

export const Doctor = model<DoctorDocument>('Doctor', doctorSchema);
