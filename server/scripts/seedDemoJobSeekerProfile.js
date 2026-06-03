import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import User from '../models/User.js';
import CandidateProfile from '../models/CandidateProfile.js';
import bcrypt from 'bcrypt';

async function seedDemoJobSeekerProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Demo user credentials
    const demoEmail = 'demo.jobseeker@example.com';
    const demoPassword = 'Demo@123';

    // Check if demo user already exists
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      console.log('⚠️  Demo user already exists. Updating profile...');
    } else {
      // Create demo user account
      console.log('👤 Creating demo job seeker user...');
      const hashedPassword = await bcrypt.hash(demoPassword, 10);

      demoUser = new User({
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: demoEmail,
        password: hashedPassword,
        role: 'applicant',
        isActive: true,
        isEmailVerified: true
      });

      await demoUser.save();
      console.log('✅ Demo user created successfully');
    }

    // Delete existing profile if any
    await CandidateProfile.deleteOne({ 'personalInfo.email': demoEmail });

    // Create comprehensive candidate profile
    console.log('📝 Creating comprehensive candidate profile...');

    // Generate unique candidateId
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const candidateId = `CAND-${year}-${randomNum}`;

    const demoProfile = new CandidateProfile({
      candidateId: candidateId,
      personalInfo: {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: demoEmail,
        phone: '+91 9876543210',
        alternatePhone: '+91 9876543211',
        dateOfBirth: new Date('1995-06-15'),
        profilePictureUrl: 'https://via.placeholder.com/150',
        address: {
          street: '123, MG Road, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560034',
          country: 'India'
        }
      },

      professionalInfo: {
        currentRole: 'Senior Software Engineer',
        currentCompany: 'Tech Innovations Pvt Ltd',
        totalExperience: '6 years 3 months',
        relevantExperience: '5 years 8 months',
        expectedSalary: '₹28,00,000',
        currentSalary: '₹22,00,000',
        noticePeriod: '2 Months',
        workAuthorization: 'Indian Citizen',
        bio: 'Passionate software engineer with 6+ years of experience in building scalable web applications. Expertise in full-stack development with a focus on React, Node.js, and cloud technologies. Led multiple successful projects from conception to deployment, mentored junior developers, and consistently delivered high-quality solutions. Strong problem-solving skills with a proven track record of optimizing application performance and improving user experience.',
        availability: 'Available in 2 months'
      },

      educationHistory: {
        tenthGrade: {
          board: 'CBSE',
          schoolName: 'Delhi Public School, Bangalore',
          yearOfPassing: 2010,
          percentage: '92.4%',
          grade: 'A+',
          subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies']
        },
        twelfthGrade: {
          board: 'CBSE',
          schoolName: 'Delhi Public School, Bangalore',
          stream: 'Science (PCM)',
          yearOfPassing: 2012,
          percentage: '94.2%',
          grade: 'A+',
          subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science']
        },
        graduation: {
          degree: 'B.Tech',
          specialization: 'Computer Science and Engineering',
          university: 'Visvesvaraya Technological University',
          collegeName: 'RV College of Engineering',
          yearOfPassing: 2016,
          cgpa: '8.9',
          percentage: '89%',
          grade: 'First Class with Distinction',
          projects: [
            {
              title: 'E-Commerce Platform',
              description: 'Built a complete e-commerce platform with payment gateway integration',
              technologies: ['Java', 'MySQL', 'Spring Boot', 'Angular'],
              duration: '6 months'
            },
            {
              title: 'Smart Home Automation System',
              description: 'IoT-based home automation system with mobile app control',
              technologies: ['Python', 'Arduino', 'Android', 'MQTT'],
              duration: '4 months'
            }
          ]
        },
        postGraduation: {
          degree: 'M.Tech',
          specialization: 'Cloud Computing and Virtualization',
          university: 'Indian Institute of Science',
          collegeName: 'IISc Bangalore',
          yearOfPassing: 2018,
          cgpa: '9.2',
          percentage: '92%',
          grade: 'Distinction',
          thesis: {
            title: 'Optimizing Resource Allocation in Cloud Computing Environments',
            description: 'Research on improving resource utilization and cost optimization in cloud infrastructures',
            guide: 'Dr. Suresh Ramachandran'
          },
          projects: [
            {
              title: 'Cloud Resource Scheduler',
              description: 'Developed an intelligent resource scheduling algorithm for cloud environments',
              technologies: ['Python', 'Kubernetes', 'Docker', 'TensorFlow'],
              duration: '8 months'
            }
          ]
        },
        additionalQualifications: [
          {
            qualificationType: 'Professional Certification',
            courseName: 'AWS Certified Solutions Architect - Professional',
            institution: 'Amazon Web Services',
            yearOfCompletion: 2020,
            duration: '3 months preparation',
            grade: 'Pass',
            description: 'Advanced certification covering cloud architecture and best practices'
          },
          {
            qualificationType: 'Professional Certification',
            courseName: 'Google Cloud Professional Cloud Architect',
            institution: 'Google Cloud',
            yearOfCompletion: 2021,
            duration: '2 months preparation',
            grade: 'Pass',
            description: 'Certification demonstrating expertise in GCP architecture'
          }
        ]
      },

      workExperienceHistory: [
        {
          companyName: 'Tech Innovations Pvt Ltd',
          jobTitle: 'Senior Software Engineer',
          department: 'Engineering',
          employmentType: 'Full-time',
          startDate: new Date('2021-03-01'),
          endDate: null,
          isCurrentJob: true,
          location: 'Bangalore, Karnataka',
          workMode: 'Hybrid',
          responsibilities: [
            'Lead development of microservices architecture for core platform',
            'Mentor team of 5 junior developers',
            'Architect and implement scalable cloud solutions',
            'Conduct code reviews and establish coding standards',
            'Collaborate with product managers to define technical requirements'
          ],
          achievements: [
            'Reduced API response time by 60% through optimization',
            'Successfully migrated monolithic application to microservices',
            'Implemented CI/CD pipeline reducing deployment time by 70%',
            'Led team that won "Innovation Award" for Q3 2023'
          ],
          technologies: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'Redis'],
          teamSize: '8 members',
          reportingManager: {
            name: 'Amit Sharma',
            designation: 'Engineering Manager',
            email: 'amit.sharma@techinnovations.com',
            phone: '+91 9876543220'
          },
          reasonForLeaving: '',
          salary: {
            amount: '₹22,00,000',
            currency: 'INR'
          },
          projects: [
            {
              name: 'Customer Analytics Platform',
              description: 'Built real-time analytics platform processing 1M+ events daily',
              role: 'Tech Lead',
              technologies: ['React', 'Node.js', 'Kafka', 'ClickHouse', 'AWS'],
              duration: '8 months',
              teamSize: '5',
              achievements: ['Reduced query time by 80%', 'Achieved 99.9% uptime']
            }
          ]
        },
        {
          companyName: 'Digital Solutions Inc',
          jobTitle: 'Software Engineer',
          department: 'Product Development',
          employmentType: 'Full-time',
          startDate: new Date('2018-07-01'),
          endDate: new Date('2021-02-28'),
          isCurrentJob: false,
          location: 'Pune, Maharashtra',
          workMode: 'On-site',
          responsibilities: [
            'Developed and maintained web applications using MERN stack',
            'Implemented RESTful APIs and integrated third-party services',
            'Wrote unit and integration tests',
            'Participated in agile ceremonies and sprint planning'
          ],
          achievements: [
            'Delivered 3 major features ahead of schedule',
            'Improved code coverage from 60% to 85%',
            'Received "Star Performer" award in 2019'
          ],
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Jest', 'Git'],
          teamSize: '6 members',
          reportingManager: {
            name: 'Priya Deshmukh',
            designation: 'Team Lead',
            email: 'priya.d@digitalsolutions.com',
            phone: '+91 9876543221'
          },
          reasonForLeaving: 'Career growth and better opportunities',
          salary: {
            amount: '₹12,00,000',
            currency: 'INR'
          }
        },
        {
          companyName: 'StartUp Ventures',
          jobTitle: 'Junior Developer',
          department: 'Engineering',
          employmentType: 'Full-time',
          startDate: new Date('2016-08-01'),
          endDate: new Date('2018-06-30'),
          isCurrentJob: false,
          location: 'Bangalore, Karnataka',
          workMode: 'On-site',
          responsibilities: [
            'Developed frontend components using React',
            'Fixed bugs and implemented minor features',
            'Collaborated with senior developers',
            'Participated in daily standups'
          ],
          achievements: [
            'Successfully completed onboarding in 2 weeks',
            'Contributed to 2 major product releases'
          ],
          technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
          teamSize: '4 members',
          reportingManager: {
            name: 'Vikram Singh',
            designation: 'Senior Developer',
            email: 'vikram@startupventures.com',
            phone: '+91 9876543222'
          },
          reasonForLeaving: 'Seeking more challenging role',
          salary: {
            amount: '₹6,00,000',
            currency: 'INR'
          }
        }
      ],

      references: [
        {
          name: 'Amit Sharma',
          designation: 'Engineering Manager',
          company: 'Tech Innovations Pvt Ltd',
          email: 'amit.sharma@techinnovations.com',
          phone: '+91 9876543220',
          relationship: 'Current Manager',
          workingRelationship: 'Direct manager for past 3 years, worked closely on multiple projects',
          yearsKnown: '3 years',
          canContact: true,
          bestTimeToContact: '10 AM - 6 PM IST',
          notes: 'Can speak about technical skills and leadership abilities',
          referenceType: 'Professional'
        },
        {
          name: 'Priya Deshmukh',
          designation: 'Senior Engineering Manager',
          company: 'Digital Solutions Inc',
          email: 'priya.d@digitalsolutions.com',
          phone: '+91 9876543221',
          relationship: 'Former Manager',
          workingRelationship: 'Team Lead during my tenure at Digital Solutions',
          yearsKnown: '5 years',
          canContact: true,
          bestTimeToContact: '11 AM - 5 PM IST',
          notes: 'Can provide insights on professional growth and work ethic',
          referenceType: 'Professional'
        },
        {
          name: 'Dr. Suresh Ramachandran',
          designation: 'Professor',
          company: 'Indian Institute of Science',
          email: 'suresh.r@iisc.ac.in',
          phone: '+91 9876543223',
          relationship: 'Academic Reference',
          workingRelationship: 'M.Tech thesis guide and mentor',
          yearsKnown: '6 years',
          canContact: true,
          bestTimeToContact: '2 PM - 5 PM IST',
          notes: 'Can speak about research capabilities and academic performance',
          referenceType: 'Academic'
        }
      ],

      skillsAndCertifications: {
        technicalSkills: [
          { skillName: 'JavaScript', proficiencyLevel: 'Expert', yearsOfExperience: '6', lastUsed: '2024' },
          { skillName: 'React', proficiencyLevel: 'Expert', yearsOfExperience: '6', lastUsed: '2024' },
          { skillName: 'Node.js', proficiencyLevel: 'Expert', yearsOfExperience: '6', lastUsed: '2024' },
          { skillName: 'TypeScript', proficiencyLevel: 'Advanced', yearsOfExperience: '4', lastUsed: '2024' },
          { skillName: 'AWS', proficiencyLevel: 'Advanced', yearsOfExperience: '5', lastUsed: '2024' },
          { skillName: 'Docker', proficiencyLevel: 'Advanced', yearsOfExperience: '4', lastUsed: '2024' },
          { skillName: 'Kubernetes', proficiencyLevel: 'Advanced', yearsOfExperience: '3', lastUsed: '2024' },
          { skillName: 'MongoDB', proficiencyLevel: 'Advanced', yearsOfExperience: '5', lastUsed: '2024' },
          { skillName: 'PostgreSQL', proficiencyLevel: 'Advanced', yearsOfExperience: '4', lastUsed: '2024' },
          { skillName: 'Redis', proficiencyLevel: 'Intermediate', yearsOfExperience: '3', lastUsed: '2024' },
          { skillName: 'GraphQL', proficiencyLevel: 'Intermediate', yearsOfExperience: '2', lastUsed: '2024' },
          { skillName: 'Python', proficiencyLevel: 'Intermediate', yearsOfExperience: '4', lastUsed: '2023' },
          { skillName: 'Java', proficiencyLevel: 'Intermediate', yearsOfExperience: '3', lastUsed: '2022' }
        ],
        softSkills: [
          'Leadership',
          'Team Collaboration',
          'Problem Solving',
          'Communication',
          'Project Management',
          'Mentoring',
          'Agile Methodologies',
          'Critical Thinking'
        ],
        certifications: [
          {
            name: 'AWS Certified Solutions Architect - Professional',
            issuer: 'Amazon Web Services',
            issueDate: new Date('2020-08-15'),
            expiryDate: new Date('2026-08-15'),
            credentialId: 'AWS-PSA-12345',
            credentialUrl: 'https://aws.amazon.com/verification/12345',
            status: 'Active'
          },
          {
            name: 'Google Cloud Professional Cloud Architect',
            issuer: 'Google Cloud',
            issueDate: new Date('2021-05-20'),
            expiryDate: new Date('2025-05-20'),
            credentialId: 'GCP-PCA-67890',
            credentialUrl: 'https://cloud.google.com/certification/verify/67890',
            status: 'Active'
          },
          {
            name: 'Certified Kubernetes Administrator (CKA)',
            issuer: 'Cloud Native Computing Foundation',
            issueDate: new Date('2022-03-10'),
            expiryDate: new Date('2025-03-10'),
            credentialId: 'CKA-54321',
            credentialUrl: 'https://www.cncf.io/certification/verify/54321',
            status: 'Active'
          }
        ],
        languages: [
          { name: 'English', proficiency: 'Advanced', canRead: true, canWrite: true, canSpeak: true },
          { name: 'Hindi', proficiency: 'Native', canRead: true, canWrite: true, canSpeak: true },
          { name: 'Kannada', proficiency: 'Intermediate', canRead: true, canWrite: true, canSpeak: true }
        ]
      },

      resume: {
        fileName: 'Rajesh_Kumar_Resume.pdf',
        fileUrl: '/uploads/resumes/demo-resume.pdf',
        fileSize: 245678,
        uploadDate: new Date(),
        extractedText: 'Resume content extracted...',
        aiAnalysis: {
          extractedSkills: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
          extractedExperience: '6+ years',
          extractedEducation: 'M.Tech in Cloud Computing',
          extractedCertifications: ['AWS', 'GCP', 'CKA'],
          analysisDate: new Date(),
          confidenceScore: 95
        }
      },

      socialLinks: {
        linkedin: 'https://linkedin.com/in/rajeshkumar-dev',
        github: 'https://github.com/rajeshkumar',
        portfolio: 'https://rajeshkumar.dev',
        twitter: 'https://twitter.com/rajesh_dev',
        personalWebsite: 'https://rajeshkumar.com'
      },

      backgroundCheck: {
        status: 'Completed',
        lastCheckedDate: new Date('2024-01-15'),
        documents: [
          {
            type: 'Aadhar',
            number: 'XXXX-XXXX-1234',
            verified: true,
            verificationDate: new Date('2024-01-15')
          },
          {
            type: 'PAN',
            number: 'ABCDE1234F',
            verified: true,
            verificationDate: new Date('2024-01-15')
          }
        ],
        criminalRecord: {
          checked: true,
          status: 'Clear',
          date: new Date('2024-01-15')
        },
        addressVerification: {
          status: 'Verified',
          verifiedBy: 'Background Check Agency',
          date: new Date('2024-01-15')
        }
      },

      careerPreferences: {
        preferredRoles: ['Senior Software Engineer', 'Tech Lead', 'Engineering Manager', 'Solutions Architect'],
        preferredIndustries: ['Technology', 'SaaS', 'Cloud Computing', 'FinTech', 'E-commerce'],
        preferredLocations: ['Bangalore', 'Hyderabad', 'Pune', 'Remote'],
        preferredWorkMode: 'Hybrid',
        preferredJobTypes: ['Full-time', 'Contract'],
        preferredCompanySize: 'Medium (201-1000)',
        salaryExpectations: {
          minimum: '₹25,00,000',
          maximum: '₹32,00,000',
          currency: 'INR',
          negotiable: true
        },
        careerGoals: 'Aspiring to take on leadership roles in engineering while staying hands-on with cutting-edge technologies. Looking to work on impactful products that solve real-world problems. Goal is to become an Engineering Manager within 2 years while continuing to contribute to technical architecture and mentoring teams.',
        willingToRelocate: true,
        availabilityToJoin: '2 months notice period'
      },

      source: 'Manual Registration',
      isActive: true,
      tags: ['Full Stack', 'Cloud Expert', 'AWS Certified', 'Team Lead', 'High Performer'],
      notes: 'Excellent candidate with strong technical skills and leadership potential. Highly recommended for senior roles.',
      createdBy: demoUser._id,
      profileViews: 45,
      lastLoginDate: new Date()
    });

    await demoProfile.save();
    console.log('✅ Demo candidate profile created successfully');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Demo Profile Summary:');
    console.log(`   - Candidate ID: ${demoProfile.candidateId}`);
    console.log(`   - Name: ${demoProfile.personalInfo.firstName} ${demoProfile.personalInfo.lastName}`);
    console.log(`   - Email: ${demoProfile.personalInfo.email}`);
    console.log(`   - Current Role: ${demoProfile.professionalInfo.currentRole}`);
    console.log(`   - Total Experience: ${demoProfile.professionalInfo.totalExperience}`);
    console.log(`   - Profile Completeness: ${demoProfile.profileCompleteness}%`);
    console.log('\n👤 Login Credentials:');
    console.log(`   - Email: ${demoEmail}`);
    console.log(`   - Password: ${demoPassword}`);
    console.log('\n💡 This profile will appear in the Admin Candidates Database!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedDemoJobSeekerProfile();