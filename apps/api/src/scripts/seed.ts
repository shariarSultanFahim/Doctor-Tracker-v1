import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.model.js';

dotenv.config();

async function seedAdmin() {
  await connectDB();
  const email = 'admin@doctortracker.com';
  const existingAdmin = await User.findOne({ email });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'System Admin',
      email,
      passwordHash,
      role: 'admin',
    });
    console.log('Seed: Admin user created successfully (admin@doctortracker.com / admin123)');
  } else {
    console.log('Seed: Admin user already exists');
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
