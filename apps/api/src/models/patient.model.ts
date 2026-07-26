import { Schema, model, Document, Types } from 'mongoose';
import { Patient as IPatient } from '@doctor-tracker/shared-types';

export interface PatientDocument extends Omit<IPatient, '_id' | 'doctorId' | 'visitDate'>, Document {
  doctorId: Types.ObjectId;
  visitDate: Date;
}

const patientSchema = new Schema<PatientDocument>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    condition: { type: String, required: true },
    phone: { type: String, required: true },
    visitDate: { type: Date, required: true },
    notes: { type: String },
    avatar: { type: String },
    bloodGroup: { type: String },
    emergencyContact: { type: String },
    address: { type: String },
    allergies: { type: [String], default: [] },
    medicalHistory: { type: [String], default: [] },
  },
  { timestamps: true }
);

patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ name: 'text' });

export const Patient = model<PatientDocument>('Patient', patientSchema);
