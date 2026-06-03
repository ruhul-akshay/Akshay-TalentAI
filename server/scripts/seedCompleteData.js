
import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import User from '../models/User.js';
import JobRole from '../models/JobRole.js';
import JobApplication from '../models/JobApplication.js';

const applicationSources = ['LinkedIn', 'Naukri', 'Glassdoor', 'Direct Application', 'Indeed', 'Monster', 'Company Website', 'Referral'];

const sampleJobRoles = [
  {
    title: 'Senior Full Stack Developer',
    description: 'We are seeking an experienced Full Stack Developer with expertise in MERN stack to join our growing team. You will be responsible for developing scalable web applications and leading technical initiatives.',
    department: 'Engineering',
    experienceLevel: 'senior',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'AWS', 'Docker'],
    location: 'Bangalore, Karnataka',
    workMode: 'hybrid',
    salaryRange: { min: 120, max: 180 },
    type: 'Full-time',
    urgency: 'high',
    status: 'active',
    positionCount: 2
  },
  {
    title: 'Data Scientist',
    description: 'Looking for a skilled Data Scientist to analyze complex datasets and build ML models. Experience with Python, TensorFlow, and data visualization tools required.',
    department: 'Data Science',
    experienceLevel: 'mid',
    skills: ['Python', 'TensorFlow', 'Pandas', 'NumPy', 'Machine Learning', 'SQL', 'Power BI'],
    location: 'Hyderabad, Telangana',
    workMode: 'remote',
    salaryRange: { min: 100, max: 150 },
    type: 'Full-time',
    urgency: 'medium',
    status: 'active',
    positionCount: 1
  },
  {
    title: 'Frontend Developer',
    description: 'Join our UI team to create beautiful and responsive web interfaces. Strong knowledge of React, CSS, and modern frontend tools required.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux', 'Tailwind CSS', 'Webpack'],
    location: 'Pune, Maharashtra',
    workMode: 'onsite',
    salaryRange: { min: 80, max: 120 },
    type: 'Full-time',
    urgency: 'low',
    status: 'active',
    positionCount: 3
  },
  {
    title: 'DevOps Engineer',
    description: 'Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes essential.',
    department: 'Infrastructure',
    experienceLevel: 'senior',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux', 'Python'],
    location: 'Mumbai, Maharashtra',
    workMode: 'hybrid',
    salaryRange: { min: 110, max: 160 },
    type: 'Full-time',
    urgency: 'high',
    status: 'active',
    positionCount: 1
  }
];

const sampleCandidates = [
  {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@example.com',
    password: 'candidate123',
    role: 'applicant',
    profile: {
      phone: '+91 9876543210',
      bio: 'Experienced Full Stack Developer with 5+ years in MERN stack. Passionate about building scalable applications.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'AWS'],
      experience: '5 years',
      education: 'B.Tech in Computer Science, IIT Delhi',
      currentCompany: 'TCS',
      currentDesignation: 'Senior Developer',
      totalExperience: '5 years',
      expectedSalary: '₹25 LPA',
      noticePeriod: '2 months',
      linkedIn: 'https://linkedin.com/in/rahulsharma',
      portfolio: 'https://rahulsharma.dev'
    }
  },
  {
    firstName: 'Priya',
    lastName: 'Verma',
    email: 'priya.verma@example.com',
    password: 'candidate123',
    role: 'applicant',
    profile: {
      phone: '+91 9876543211',
      bio: 'Data Scientist with expertise in ML and AI. Published researcher with 3 years industry experience.',
      skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'Machine Learning', 'Deep Learning'],
      experience: '3 years',
      education: 'M.Tech in Data Science, BITS Pilani',
      currentCompany: 'Infosys',
      currentDesignation: 'Data Analyst',
      totalExperience: '3 years',
      expectedSalary: '₹20 LPA',
      noticePeriod: '1 month',
      linkedIn: 'https://linkedin.com/in/priyaverma'
    }
  },
  {
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@example.com',
    password: 'candidate123',
    role: 'applicant',
    profile: {
      phone: '+91 9876543212',
      bio: 'Frontend specialist with a keen eye for design. 4 years of experience in React ecosystem.',
      skills: ['React', 'TypeScript', 'CSS', 'Tailwind', 'Redux', 'JavaScript'],
      experience: '4 years',
      education: 'BCA, Mumbai University',
      currentCompany: 'Wipro',
      currentDesignation: 'UI Developer',
      totalExperience: '4 years',
      expectedSalary: '₹18 LPA',
      noticePeriod: '1 month',
      linkedIn: 'https://linkedin.com/in/amitpatel',
      github: 'https://github.com/amitpatel'
    }
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@example.com',
    password: 'candidate123',
    role: 'applicant',
    profile: {
      phone: '+91 9876543213',
      bio: 'DevOps Engineer with strong cloud infrastructure knowledge. AWS and Kubernetes certified.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'CI/CD', 'Linux'],
      experience: '6 years',
      education: 'B.E. in Information Technology, Anna University',
      currentCompany: 'Accenture',
      currentDesignation: 'Senior DevOps Engineer',
      totalExperience: '6 years',
      expectedSalary: '₹28 LPA',
      noticePeriod: '3 months',
      linkedIn: 'https://linkedin.com/in/snehareddy'
    }
  }
];

const sampleReferences = [
  [
    {
      name: 'Rajesh Kumar',
      designation: 'Engineering Manager',
      company: 'TCS',
      email: 'rajesh.kumar@tcs.com',
      phone: '+91 9876543220',
      relationship: 'Former Manager',
      yearsKnown: '3 years',
      canContact: true,
      rating: 5
    },
    {
      name: 'Suresh Menon',
      designation: 'Tech Lead',
      company: 'TCS',
      email: 'suresh.menon@tcs.com',
      phone: '+91 9876543221',
      relationship: 'Colleague',
      yearsKnown: '4 years',
      canContact: true,
      rating: 4
    }
  ],
  [
    {
      name: 'Dr. Lakshmi Iyer',
      designation: 'Senior Data Scientist',
      company: 'Infosys',
      email: 'lakshmi.iyer@infosys.com',
      phone: '+91 9876543222',
      relationship: 'Current Manager',
      yearsKnown: '2 years',
      canContact: true,
      rating: 5
    }
  ],
  [
    {
      name: 'Karthik Shah',
      designation: 'Frontend Lead',
      company: 'Wipro',
      email: 'karthik.shah@wipro.com',
      phone: '+91 9876543223',
      relationship: 'Former Manager',
      yearsKnown: '3 years',
      canContact: true,
      rating: 4
    }
  ],
  [
    {
      name: 'Vikram Singh',
      designation: 'DevOps Manager',
      company: 'Accenture',
      email: 'vikram.singh@accenture.com',
      phone: '+91 9876543224',
      relationship: 'Current Manager',
      yearsKnown: '4 years',
      canContact: true,
      rating: 5
    },
    {
      name: 'Anita Desai',
      designation: 'Cloud Architect',
      company: 'Accenture',
      email: 'anita.desai@accenture.com',
      phone: '+91 9876543225',
      relationship: 'Colleague',
      yearsKnown: '5 years',
      canContact: true,
      rating: 5
    }
  ]
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await JobApplication.deleteMany({});
    await JobRole.deleteMany({});
    await User.deleteMany({ role: 'applicant' });

    // Create job roles
    console.log('📝 Creating job roles...');
    const createdJobs = await JobRole.create(sampleJobRoles);
    console.log(`✅ Created ${createdJobs.length} job roles`);

    // Create candidates
    console.log('👥 Creating candidates...');
    const createdCandidates = [];
    for (const candidateData of sampleCandidates) {
      const candidate = new User(candidateData);
      await candidate.save();
      createdCandidates.push(candidate);
    }
    console.log(`✅ Created ${createdCandidates.length} candidates`);

    // Create applications with references
    console.log('📋 Creating applications...');
    const applications = [];
    
    // Rahul applies to Senior Full Stack Developer
    applications.push({
      applicant: createdCandidates[0]._id,
      job: createdJobs[0]._id,
      status: 'shortlisted',
      coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With 5+ years of experience in MERN stack, I have successfully delivered multiple scalable applications.',
      applicationSource: 'LinkedIn',
      references: sampleReferences[0],
      hiringDetails: {
        hiringCompany: 'TechCorp Solutions',
        hiringDepartment: 'Engineering',
        positionAppliedFor: 'Senior Full Stack Developer',
        offerStatus: 'Not Offered'
      },
      aiAnalysis: {
        matchPercentage: 92,
        atsScore: {
          overall: 92,
          keywordMatch: 95,
          skillsAlignment: 90,
          experienceRelevance: 95,
          educationFit: 90,
          formatCompatibility: 100
        },
        experienceAnalysis: {
          totalYears: 5,
          relevantYears: 4,
          experienceMatch: 'senior',
          careerProgression: 'excellent'
        },
        skillsAnalysis: {
          matchingSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
          missingCriticalSkills: ['Docker']
        },
        missingSkills: ['Docker', 'TypeScript'],
        experienceMatch: 'excellent',
        educationRelevance: 'high',
        strengths: ['Strong MERN stack experience', 'Good leadership potential', 'Excellent problem-solving skills'],
        weaknesses: ['Limited Docker experience', 'Could improve TypeScript skills'],
        recommendations: ['Consider for senior role', 'Technical interview recommended'],
        overallAssessment: 'Excellent candidate with strong technical background',
        interviewReadiness: 'high',
        analysisDate: new Date()
      }
    });

    // Priya applies to Data Scientist
    applications.push({
      applicant: createdCandidates[1]._id,
      job: createdJobs[1]._id,
      status: 'interview-scheduled',
      coverLetter: 'As a passionate Data Scientist with 3 years of experience in ML and AI, I am thrilled about this opportunity to contribute to your data science team.',
      applicationSource: 'Naukri',
      references: sampleReferences[1],
      hiringDetails: {
        hiringCompany: 'DataTech Analytics',
        hiringDepartment: 'Data Science',
        positionAppliedFor: 'Data Scientist',
        offerStatus: 'Not Offered'
      },
      interviewDetails: {
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Virtual',
        interviewType: 'video',
        interviewer: 'Dr. Anil Gupta'
      },
      aiAnalysis: {
        matchPercentage: 88,
        matchingSkills: ['Python', 'TensorFlow', 'Pandas', 'Machine Learning'],
        missingSkills: ['Power BI', 'NumPy'],
        experienceMatch: 'good',
        educationRelevance: 'excellent',
        strengths: ['Strong ML background', 'Research experience', 'Good academic credentials'],
        weaknesses: ['Limited visualization tools experience'],
        recommendations: ['Proceed to technical interview', 'Assess practical ML project experience'],
        overallAssessment: 'Strong candidate with solid ML foundation',
        interviewReadiness: 'high',
        analysisDate: new Date()
      }
    });

    // Amit applies to Frontend Developer
    applications.push({
      applicant: createdCandidates[2]._id,
      job: createdJobs[2]._id,
      status: 'reviewing',
      coverLetter: 'I am applying for the Frontend Developer position. My 4 years of experience in React and modern frontend technologies align perfectly with your requirements.',
      applicationSource: 'Glassdoor',
      references: sampleReferences[2],
      hiringDetails: {
        hiringCompany: 'WebCraft Studios',
        hiringDepartment: 'Engineering',
        positionAppliedFor: 'Frontend Developer',
        offerStatus: 'Not Offered'
      },
      aiAnalysis: {
        matchPercentage: 85,
        matchingSkills: ['React', 'JavaScript', 'CSS', 'Redux', 'Tailwind CSS'],
        missingSkills: ['Webpack', 'HTML'],
        experienceMatch: 'good',
        educationRelevance: 'medium',
        strengths: ['Strong React skills', 'Good design sense', 'Modern CSS knowledge'],
        weaknesses: ['Limited build tools knowledge'],
        recommendations: ['Schedule UI/UX assessment', 'Review portfolio projects'],
        overallAssessment: 'Good frontend developer with solid React experience',
        interviewReadiness: 'medium',
        analysisDate: new Date()
      }
    });

    // Sneha applies to DevOps Engineer
    applications.push({
      applicant: createdCandidates[3]._id,
      job: createdJobs[3]._id,
      status: 'hired',
      coverLetter: 'I am excited to apply for the DevOps Engineer role. With 6 years of experience in cloud infrastructure and CI/CD, I can bring immediate value to your team.',
      applicationSource: 'Direct Application',
      references: sampleReferences[3],
      hiringDetails: {
        hiringCompany: 'CloudOps Inc',
        hiringDepartment: 'Infrastructure',
        positionAppliedFor: 'DevOps Engineer',
        offerStatus: 'Offer Accepted',
        offerDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        joiningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        offeredSalary: '₹28 LPA',
        offeredDesignation: 'Senior DevOps Engineer'
      },
      aiAnalysis: {
        matchPercentage: 95,
        matchingSkills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux', 'Python'],
        missingSkills: [],
        experienceMatch: 'excellent',
        educationRelevance: 'high',
        strengths: ['Extensive DevOps experience', 'AWS certified', 'Strong automation skills', 'Excellent problem-solving'],
        weaknesses: [],
        recommendations: ['Top candidate', 'Extend offer immediately'],
        overallAssessment: 'Outstanding DevOps professional with all required skills',
        interviewReadiness: 'excellent',
        analysisDate: new Date()
      }
    });

    // Create additional applications from same candidates to different jobs
    applications.push({
      applicant: createdCandidates[0]._id,
      job: createdJobs[2]._id,
      status: 'rejected',
      coverLetter: 'Applying for frontend role to explore UI development opportunities.',
      applicationSource: 'Indeed',
      references: sampleReferences[0],
      hiringDetails: {
        hiringCompany: 'WebCraft Studios',
        hiringDepartment: 'Engineering',
        positionAppliedFor: 'Frontend Developer',
        offerStatus: 'Not Offered'
      },
      adminNotes: 'Candidate is overqualified for this position. Better suited for full-stack roles.',
      aiAnalysis: {
        matchPercentage: 65,
        matchingSkills: ['React', 'JavaScript'],
        missingSkills: ['CSS expertise', 'Tailwind CSS', 'Design skills'],
        experienceMatch: 'overqualified',
        educationRelevance: 'high',
        strengths: ['Strong technical background'],
        weaknesses: ['Limited frontend-specific experience', 'More backend focused'],
        recommendations: ['Not a good fit for this role'],
        overallAssessment: 'Overqualified candidate, better for full-stack positions',
        interviewReadiness: 'low',
        analysisDate: new Date()
      }
    });

    const createdApplications = await JobApplication.create(applications);
    console.log(`✅ Created ${createdApplications.length} applications with complete details`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Job Roles: ${createdJobs.length}`);
    console.log(`   - Candidates: ${createdCandidates.length}`);
    console.log(`   - Applications: ${createdApplications.length}`);
    console.log('\n👥 Sample Login Credentials:');
    console.log('   Email: rahul.sharma@example.com | Password: candidate123');
    console.log('   Email: priya.verma@example.com | Password: candidate123');
    console.log('   Email: amit.patel@example.com | Password: candidate123');
    console.log('   Email: sneha.reddy@example.com | Password: candidate123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedDatabase();
