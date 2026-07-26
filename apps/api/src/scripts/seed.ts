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
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const sampleAddresses = [
    '742 Evergreen Terrace, Springfield',
    '123 Maple Street, Boston, MA',
    '456 Oak Avenue, Chicago, IL',
    '789 Pine Road, Seattle, WA',
    '321 Elm Street, Austin, TX'
  ];
  const sampleAllergies = [
    ['Penicillin'],
    ['Latex', 'Peanuts'],
    ['Sulfa Drugs'],
    ['Aspirin', 'Dust Mites'],
    []
  ];
  const sampleHistories = [
    ['Appendectomy (2018)', 'COVID-19 Hospitalization (2021)'],
    ['Mild Concussion (2019)'],
    ['Knee Arthroscopy (2020)', 'Seasonal Allergies'],
    ['Gallbladder Surgery (2017)'],
    ['None reported']
  ];

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
      notes: `Routine follow-up consultation for patient ${i}. Patient reports stable vitals and compliant medication schedule.`,
      bloodGroup: bloodGroups[i % bloodGroups.length],
      emergencyContact: `+1 555-09${10 + i} (Family Member)`,
      address: sampleAddresses[i % sampleAddresses.length],
      allergies: sampleAllergies[i % sampleAllergies.length],
      medicalHistory: sampleHistories[i % sampleHistories.length],
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
