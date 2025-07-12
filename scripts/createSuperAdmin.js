
import { connect } from 'mongoose';
import { findOne, create } from '../models/User';
import { config } from 'dotenv';

config();

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await create({
      name: 'Super Administrator',
      email: 'superadmin@healthcare.com',
      password: 'SuperAdmin123!',
      phone: '+1234567890',
      role: 'super_admin',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'USA'
      }
    });

    console.log('Super admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: SuperAdmin123!');
    console.log('Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
