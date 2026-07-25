import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';

dotenv.config();

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
  ]);

  console.log('Seeding admin user...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@doctortracker.com',
    passwordHash,
    role: 'admin',
  });

  console.log('Seeding doctors...');
  const doctorsData = [
    { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology', hospital: 'City General Hospital', phone: '+1 555-0191', email: 's.jenkins@cityhospital.org' },
    { name: 'Dr. Michael Chen', specialization: 'Neurology', hospital: 'St. Jude Medical Center', phone: '+1 555-0192', email: 'm.chen@stjude.org' },
    { name: 'Dr. Elena Rostova', specialization: 'Pediatrics', hospital: 'Children Hospital West', phone: '+1 555-0193', email: 'e.rostova@childrenwest.org' },
    { name: 'Dr. Marcus Vance', specialization: 'Orthopedics', hospital: 'Metropolitan Health', phone: '+1 555-0194', email: 'm.vance@metrohealth.org' },
    { name: 'Dr. Aisha Patel', specialization: 'Dermatology', hospital: 'Skin & Laser Institute', phone: '+1 555-0195', email: 'a.patel@skinlaser.org' },
  ];
  const createdDoctors = await Doctor.insertMany(doctorsData);

  console.log('Seeding patients...');
  const conditions = ['Hypertension', 'Migraine', 'Asthma', 'Type 2 Diabetes', 'Osteoarthritis', 'Eczema'];
  const genders: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];

  const patientsData = [];
  for (let i = 1; i <= 25; i++) {
    const randomDoctor = createdDoctors[i % createdDoctors.length];
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() - (i * 2));

    patientsData.push({
      doctorId: randomDoctor._id,
      name: `Patient ${i}`,
      age: 20 + (i % 50),
      gender: genders[i % genders.length],
      condition: conditions[i % conditions.length],
      phone: `+1 555-02${10 + i}`,
      visitDate,
      notes: `Routine follow-up for patient ${i}`,
    });
  }
  await Patient.insertMany(patientsData);

  console.log('Seed completed successfully!');
  console.log('Default Admin Credentials: admin@doctortracker.com / admin123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
