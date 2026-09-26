import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import config from '../app/config';
import { UserModel } from '../app/modules/user/user.model';

const seedAdmin = async () => {
  try {
    if (!config.database_url) throw new Error('DATABASE_URL is required.');
    const userName = process.env.ADMIN_USERNAME?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!userName || !password) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required.');
    if (password.length < 12) throw new Error('ADMIN_PASSWORD must have at least 12 characters.');
    await mongoose.connect(config.database_url);
    const existing = await UserModel.findOne({ userName });
    if (existing) { console.log('Admin already exists.'); return; }
    await UserModel.create({ userName, password: await bcrypt.hash(password, 12), role: 'admin' });
    console.log('Admin created successfully.');
  } catch (error) {
    console.error('Admin seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};
seedAdmin();
