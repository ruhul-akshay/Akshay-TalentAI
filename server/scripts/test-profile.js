import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CandidateProfile from '../models/CandidateProfile.js';
import User from '../models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/ats');
  
  const user = await User.findOne({ email: 'demo.jobseeker@example.com' }) || 
               await User.findOne();
  
  if (!user) {
    console.log("No user found.");
    process.exit(1);
  }
  
  console.log("Found user:", user.email);
  
  try {
      let candidateProfile = new CandidateProfile({
        personalInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          phone: '',
          alternatePhone: '',
          dateOfBirth: null,
          profilePictureUrl: '',
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India'
          }
        },
        professionalInfo: {
          currentRole: '',
          currentCompany: '',
          totalExperience: '',
          relevantExperience: '',
          expectedSalary: '',
          currentSalary: '',
          noticePeriod: '',
          workAuthorization: '',
          bio: '',
          availability: ''
        },
        educationHistory: {
          tenthGrade: {
            board: '',
            schoolName: '',
            yearOfPassing: null,
            percentage: '',
            grade: '',
            subjects: []
          },
          twelfthGrade: {
            board: '',
            schoolName: '',
            stream: '',
            yearOfPassing: null,
            percentage: '',
            grade: '',
            subjects: []
          },
          graduation: {
            degree: '',
            specialization: '',
            university: '',
            collegeName: '',
            yearOfPassing: null,
            cgpa: '',
            percentage: '',
            grade: '',
            projects: []
          },
          postGraduation: {
            degree: '',
            specialization: '',
            university: '',
            collegeName: '',
            yearOfPassing: null,
            cgpa: '',
            percentage: '',
            grade: '',
            thesis: {
              title: '',
              description: '',
              guide: ''
            },
            projects: []
          },
          additionalQualifications: []
        },
        workExperienceHistory: [],
        references: [],
        skillsAndCertifications: {
          technicalSkills: [],
          softSkills: [],
          certifications: [],
          languages: []
        },
        resume: {
          fileName: '',
          fileUrl: '',
          fileSize: 0,
          uploadDate: null
        },
        socialLinks: {
          linkedin: '',
          github: '',
          portfolio: '',
          twitter: '',
          personalWebsite: ''
        },
        careerPreferences: {
          preferredRoles: [],
          preferredIndustries: [],
          preferredLocations: [],
          preferredWorkMode: '',
          preferredJobTypes: [],
          preferredCompanySize: '',
          salaryExpectations: {
            minimum: '',
            maximum: '',
            currency: 'INR',
            negotiable: false
          },
          careerGoals: '',
          willingToRelocate: false,
          availabilityToJoin: ''
        },
        source: 'Manual Registration',
        isActive: true,
        tags: [],
        notes: '',
        createdBy: user._id,
        profileViews: 0,
        lastLoginDate: new Date()
      });

      await candidateProfile.save();
      console.log('Success saved profile');
  } catch (error) {
     console.error('Validation Error:', JSON.stringify(error, null, 2));
  }
  process.exit();
}

run();
