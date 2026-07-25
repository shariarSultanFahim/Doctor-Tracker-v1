import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { User } from '../models/user.model.js';

export async function ensureIndexes(): Promise<void> {
  console.log('Ensuring all database indexes...');
  await Promise.all([
    User.syncIndexes(),
    Doctor.syncIndexes(),
    Patient.syncIndexes(),
  ]);
  console.log('Database indexes synchronized successfully');
}
