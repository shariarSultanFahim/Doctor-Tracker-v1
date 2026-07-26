import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';

dotenv.config();

export async function runSeedData() {
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
  ]);

  console.log('Seeding admin user...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'System Admin',
    email: 'admin@doctortracker.com',
    passwordHash,
    role: 'admin',
    avatar: `https://api.dicebear.com/10.x/toon-head/svg?seed=${encodeURIComponent('System Admin')}`,
  });

  console.log('Seeding doctors with DiceBear avatars...');
  const rawDoctors = [
    { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology', hospital: 'City General Hospital', phone: '+1 555-0191', email: 's.jenkins@cityhospital.org' },
    { name: 'Dr. Michael Chen', specialization: 'Neurology', hospital: 'St. Jude Medical Center', phone: '+1 555-0192', email: 'm.chen@stjude.org' },
    { name: 'Dr. Elena Rostova', specialization: 'Pediatrics', hospital: 'Children Hospital West', phone: '+1 555-0193', email: 'e.rostova@childrenwest.org' },
    { name: 'Dr. Marcus Vance', specialization: 'Orthopedics', hospital: 'Metropolitan Health', phone: '+1 555-0194', email: 'm.vance@metrohealth.org' },
    { name: 'Dr. Aisha Patel', specialization: 'Dermatology', hospital: 'Skin & Laser Institute', phone: '+1 555-0195', email: 'a.patel@skinlaser.org' },
    { name: 'Dr. Robert Stirling', specialization: 'Oncology', hospital: 'Hope Cancer Institute', phone: '+1 555-0196', email: 'r.stirling@hopecancer.org' },
  ];

  const doctorsData = rawDoctors.map((doc) => ({
    ...doc,
    avatar: `https://api.dicebear.com/10.x/toon-head/svg?seed=${encodeURIComponent(doc.name)}`,
  }));

  const createdDoctors = await Doctor.insertMany(doctorsData);

  console.log('Seeding diverse patients (8 conditions & DiceBear avatars)...');

  // Exactly 8 distinct medical conditions
  const conditions = [
    'Hypertension',
    'Type 2 Diabetes',
    'Asthma',
    'Migraine',
    'Osteoarthritis',
    'Eczema',
    'GERD',
    'Hypothyroidism',
  ] as const;

  const patientProfiles = [
    { name: 'Eleanor Vance', age: 45, gender: 'Female' as const, condition: conditions[0], bloodGroup: 'A+' },
    { name: 'Alexander Wright', age: 32, gender: 'Male' as const, condition: conditions[3], bloodGroup: 'O+' },
    { name: 'Sophia Martinez', age: 28, gender: 'Female' as const, condition: conditions[2], bloodGroup: 'B+' },
    { name: 'Liam Gallagher', age: 58, gender: 'Male' as const, condition: conditions[1], bloodGroup: 'AB+' },
    { name: 'Maya Lin', age: 62, gender: 'Female' as const, condition: conditions[4], bloodGroup: 'O-' },
    { name: 'David Kim', age: 34, gender: 'Male' as const, condition: conditions[5], bloodGroup: 'A-' },
    { name: 'Fatima Al-Hassan', age: 51, gender: 'Female' as const, condition: conditions[0], bloodGroup: 'B-' },
    { name: 'Carlos Rodriguez', age: 41, gender: 'Male' as const, condition: conditions[6], bloodGroup: 'O+' },
    { name: 'Marcus Thorne', age: 39, gender: 'Male' as const, condition: conditions[6], bloodGroup: 'A+' },
    { name: 'Chloe Bennett', age: 24, gender: 'Female' as const, condition: conditions[7], bloodGroup: 'A+' },
    { name: 'James O\'Connor', age: 67, gender: 'Male' as const, condition: conditions[1], bloodGroup: 'AB-' },
    { name: 'Aaliyah Khan', age: 30, gender: 'Female' as const, condition: conditions[5], bloodGroup: 'O+' },
    { name: 'Ethan Brooks', age: 19, gender: 'Male' as const, condition: conditions[2], bloodGroup: 'B+' },
    { name: 'Isabella Rossi', age: 53, gender: 'Female' as const, condition: conditions[7], bloodGroup: 'A+' },
    { name: 'Noah Kowalski', age: 44, gender: 'Male' as const, condition: conditions[0], bloodGroup: 'O+' },
    { name: 'Olivia Chen', age: 29, gender: 'Female' as const, condition: conditions[3], bloodGroup: 'B-' },
    { name: 'Benjamin Scott', age: 60, gender: 'Male' as const, condition: conditions[4], bloodGroup: 'AB+' },
    { name: 'Amara Okafor', age: 37, gender: 'Female' as const, condition: conditions[5], bloodGroup: 'A-' },
    { name: 'Lucas Tanaka', age: 26, gender: 'Male' as const, condition: conditions[2], bloodGroup: 'O+' },
    { name: 'Mia Sterling', age: 48, gender: 'Female' as const, condition: conditions[0], bloodGroup: 'B+' },
    { name: 'Daniel Hayes', age: 55, gender: 'Male' as const, condition: conditions[1], bloodGroup: 'A+' },
    { name: 'Charlotte Dubois', age: 33, gender: 'Female' as const, condition: conditions[3], bloodGroup: 'O-' },
    { name: 'Henry Zhao', age: 42, gender: 'Male' as const, condition: conditions[6], bloodGroup: 'B+' },
    { name: 'Harper Larson', age: 22, gender: 'Female' as const, condition: conditions[5], bloodGroup: 'A+' },
    { name: 'Sebastian Gomez', age: 59, gender: 'Male' as const, condition: conditions[0], bloodGroup: 'O+' },
    { name: 'Amelia Watson', age: 36, gender: 'Female' as const, condition: conditions[7], bloodGroup: 'AB+' },
    { name: 'Jack Sullivan', age: 50, gender: 'Male' as const, condition: conditions[0], bloodGroup: 'B-' },
    { name: 'Zoe Takahashi', age: 31, gender: 'Female' as const, condition: conditions[7], bloodGroup: 'A+' },
    { name: 'Owen Fletcher', age: 64, gender: 'Male' as const, condition: conditions[4], bloodGroup: 'O+' },
    { name: 'Lily Crawford', age: 27, gender: 'Female' as const, condition: conditions[2], bloodGroup: 'B+' },
    { name: 'Gabriel Mendoza', age: 46, gender: 'Male' as const, condition: conditions[1], bloodGroup: 'A-' },
    { name: 'Grace Kelly', age: 38, gender: 'Female' as const, condition: conditions[3], bloodGroup: 'O+' },
    { name: 'Wyatt Miller', age: 52, gender: 'Male' as const, condition: conditions[0], bloodGroup: 'B+' },
    { name: 'Chloe Nguyen', age: 25, gender: 'Female' as const, condition: conditions[5], bloodGroup: 'A+' },
    { name: 'Samuel Davis', age: 61, gender: 'Male' as const, condition: conditions[6], bloodGroup: 'O-' },
    { name: 'Hannah Ali', age: 35, gender: 'Female' as const, condition: conditions[7], bloodGroup: 'AB-' },
    { name: 'Julian Cruz', age: 43, gender: 'Male' as const, condition: conditions[4], bloodGroup: 'B+' },
    { name: 'Victoria Park', age: 49, gender: 'Female' as const, condition: conditions[7], bloodGroup: 'A+' },
    { name: 'Caleb Hoffman', age: 57, gender: 'Male' as const, condition: conditions[4], bloodGroup: 'O+' },
    { name: 'Nora Fischer', age: 30, gender: 'Female' as const, condition: conditions[2], bloodGroup: 'B-' },
  ];

  const sampleAddresses = [
    '742 Evergreen Terrace, Springfield',
    '123 Maple Street, Boston, MA',
    '456 Oak Avenue, Chicago, IL',
    '789 Pine Road, Seattle, WA',
    '321 Elm Street, Austin, TX',
    '159 Willow Drive, Denver, CO',
    '852 Cedar Lane, Miami, FL',
    '951 Birch Boulevard, San Diego, CA'
  ];

  const sampleAllergies = [
    ['Penicillin'],
    ['Latex', 'Peanuts'],
    ['Sulfa Drugs'],
    ['Aspirin', 'Dust Mites'],
    ['Shellfish'],
    ['Pollen', 'Cat Dander'],
    []
  ];

  const sampleHistories = [
    ['Appendectomy (2018)', 'COVID-19 Hospitalization (2021)'],
    ['Mild Concussion (2019)'],
    ['Knee Arthroscopy (2020)', 'Seasonal Allergies'],
    ['Gallbladder Surgery (2017)'],
    ['Tonsillectomy (2012)', 'Hypertension Diagnosis (2022)'],
    ['None reported']
  ];

  const patientsData = [];
  const now = new Date();

  for (let i = 0; i < patientProfiles.length; i++) {
    const profile = patientProfiles[i];
    const doctor = createdDoctors[i % createdDoctors.length];

    const daysAgo = Math.floor((i / patientProfiles.length) * 88) + (i % 2);
    const visitDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    visitDate.setHours(9 + (i % 8), (i * 13) % 60, 0, 0);

    const createdAt = new Date(visitDate.getTime());
    const updatedAt = new Date(visitDate.getTime());

    patientsData.push({
      doctorId: doctor._id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      condition: profile.condition,
      phone: `+1 555-0${200 + i}`,
      visitDate,
      createdAt,
      updatedAt,
      notes: `Consultation regarding ${profile.condition.toLowerCase()}. Patient vital signs recorded. Follow-up plan established with Dr. ${doctor.name.split(' ').pop()}.`,
      avatar: `https://api.dicebear.com/10.x/toon-head/svg?seed=${encodeURIComponent(profile.name)}`,
      bloodGroup: profile.bloodGroup,
      emergencyContact: `+1 555-09${10 + i} (Family Member)`,
      address: sampleAddresses[i % sampleAddresses.length],
      allergies: sampleAllergies[i % sampleAllergies.length],
      medicalHistory: sampleHistories[i % sampleHistories.length],
    });
  }

  await Patient.insertMany(patientsData);
  console.log(`Successfully seeded ${createdDoctors.length} doctors and ${patientsData.length} patients with DiceBear avatars across 8 medical conditions!`);
}

export async function seedIfEmpty() {
  const [userCount, doctorCount] = await Promise.all([
    User.countDocuments(),
    Doctor.countDocuments(),
  ]);

  if (userCount > 0 && doctorCount > 0) {
    console.log('Database already contains records. Skipping auto-seed.');
    return;
  }

  console.log('No data found in database. Running initial database seed...');
  await runSeedData();
}

// Standalone CLI execution script
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  connectDB()
    .then(async () => {
      await runSeedData();
      console.log('Default Admin Credentials: admin@doctortracker.com / admin123');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
