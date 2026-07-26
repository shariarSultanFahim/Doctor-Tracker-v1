import { Schema, model, Document } from 'mongoose';
import { User as IUser } from '@doctor-tracker/shared-types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
    avatar: { type: String },
    tablePreferences: { type: Schema.Types.Mixed, default: {} },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = model<UserDocument>('User', userSchema);
