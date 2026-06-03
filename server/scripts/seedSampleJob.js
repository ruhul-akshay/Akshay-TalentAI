
import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import JobRole from '../models/JobRole.js';

const sampleJob = {
  title: 'Senior React Developer',
  description: 'Looking for an experienced React developer to join our growing team...',
  department: 'Engineering',
  experienceLevel: 'senior',
  skills: ['5+ years React', 'TypeScript', 'Next.js', 'Team Leadership'],
  location: 'Remote',
  type: 'Full-time',
  status: 'active',
  urgency: 'high',
  applications: 45,
  views: 234,
  salaryRange: {
    min: 120,
    max: 160
  }
};

async function seedSampleJob() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');

    // Check if job already exists
    const existingJob = await JobRole.findOne({ title: sampleJob.title });
    if (existingJob) {
      console.log('Sample job already exists');
      return;
    }

    // Create the sample job
    const job = new JobRole(sampleJob);
    await job.save();
    
    console.log('Sample job created successfully:', job.title);
  } catch (error) {
    console.error('Error seeding sample job:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSampleJob();
