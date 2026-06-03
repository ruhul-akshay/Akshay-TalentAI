
import mongoose from 'mongoose';
import JobRole from '../models/JobRole.js';
import { config } from '../config/environment.js';

const seedJobRoles = [
  {
    title: 'Software Engineer',
    description: 'We are looking for a skilled Software Engineer to join our development team. The ideal candidate will have strong programming skills in JavaScript, Python, or Java, experience with web development frameworks, and knowledge of database systems. You will be responsible for developing and maintaining web applications, collaborating with cross-functional teams, and ensuring code quality through testing and code reviews.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
    location: 'San Francisco, CA',
    salaryRange: { min: 80000, max: 120000 }
  },
  {
    title: 'Senior Frontend Developer',
    description: 'We are seeking a Senior Frontend Developer with expertise in modern JavaScript frameworks and responsive design. The role involves leading frontend architecture decisions, mentoring junior developers, and collaborating with UX/UI designers to create exceptional user experiences. Strong knowledge of React, TypeScript, and CSS frameworks is essential.',
    department: 'Engineering',
    experienceLevel: 'senior',
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Redux', 'Webpack', 'Jest'],
    location: 'Remote',
    salaryRange: { min: 120000, max: 160000 }
  },
  {
    title: 'Data Scientist',
    description: 'Join our Data Science team to help drive business decisions through data analysis and machine learning. The ideal candidate will have experience with Python, R, SQL, and machine learning frameworks. You will work on predictive modeling, data visualization, and statistical analysis to provide insights that impact business strategy.',
    department: 'Data Science',
    experienceLevel: 'mid',
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Scikit-learn'],
    location: 'New York, NY',
    salaryRange: { min: 90000, max: 140000 }
  },
  {
    title: 'Product Manager',
    description: 'We are looking for a Product Manager to lead product strategy and development. The role involves working closely with engineering, design, and business teams to define product requirements, prioritize features, and ensure successful product launches. Strong analytical skills and experience with agile methodologies are required.',
    department: 'Product',
    experienceLevel: 'senior',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Roadmapping', 'Stakeholder Management'],
    location: 'Austin, TX',
    salaryRange: { min: 110000, max: 150000 }
  },
  {
    title: 'DevOps Engineer',
    description: 'Join our DevOps team to help build and maintain our cloud infrastructure. The ideal candidate will have experience with AWS, Docker, Kubernetes, and CI/CD pipelines. You will be responsible for ensuring system reliability, automating deployment processes, and optimizing application performance.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'Monitoring'],
    location: 'Seattle, WA',
    salaryRange: { min: 95000, max: 135000 }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing job roles
    await JobRole.deleteMany({});
    console.log('Cleared existing job roles');

    // Insert seed data
    const createdRoles = await JobRole.insertMany(seedJobRoles);
    console.log(`Created ${createdRoles.length} job roles`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
