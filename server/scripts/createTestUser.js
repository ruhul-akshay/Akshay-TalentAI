
import mongoose from 'mongoose';
import User from '../models/User.js';
import { config } from 'dotenv';

// Load environment variables
config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ats_pro');
    console.log('📊 Connected to MongoDB');

    // Check if test users already exist
    const existingAdmin = await User.findByEmail('admin@test.com');
    const existingUser = await User.findByEmail('user@test.com');

    if (existingAdmin && existingUser) {
      console.log('✅ Test users already exist!');
      console.log('📧 Admin: admin@test.com / admin123');
      console.log('📧 User: user@test.com / user123');
      process.exit(0);
    }

    // Create test admin user
    if (!existingAdmin) {
      const testAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      });

      await testAdmin.save();
      console.log('✅ Test admin user created successfully!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
    }

    // Create test applicant user
    if (!existingUser) {
      const testApplicant = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@test.com',
        password: 'user123',
        role: 'applicant'
      });

      await testApplicant.save();
      console.log('✅ Test applicant user created successfully!');
      console.log('📧 Email: user@test.com');
      console.log('🔑 Password: user123');
      console.log('👤 Role: applicant');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createTestUser();
