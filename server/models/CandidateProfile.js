
import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    unique: true,
    required: true
  },
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    alternatePhone: String,
    location: String,
    dateOfBirth: Date,
    profilePictureUrl: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    }
  },
  
  // Professional Information
  professionalInfo: {
    currentRole: String,
    currentCompany: String,
    totalExperience: String,
    relevantExperience: String,
    expectedSalary: String,
    currentSalary: String,
    noticePeriod: String,
    workAuthorization: String,
    bio: String,
    availability: String
  },
  
  // Complete Education History
  educationHistory: {
    // Class 10th
    tenthGrade: {
      board: String, // CBSE, ICSE, State Board, etc.
      schoolName: String,
      yearOfPassing: Number,
      percentage: String,
      grade: String,
      subjects: [String]
    },
    // Class 12th
    twelfthGrade: {
      board: String,
      schoolName: String,
      stream: String, // Science, Commerce, Arts
      yearOfPassing: Number,
      percentage: String,
      grade: String,
      subjects: [String]
    },
    // Graduation
    graduation: {
      degree: String, // B.Tech, B.E., BCA, B.Sc, etc.
      specialization: String,
      university: String,
      collegeName: String,
      yearOfPassing: Number,
      cgpa: String,
      percentage: String,
      grade: String,
      projects: [{
        title: String,
        description: String,
        technologies: [String],
        duration: String
      }]
    },
    // Post Graduation
    postGraduation: {
      degree: String, // M.Tech, MCA, MBA, M.Sc, etc.
      specialization: String,
      university: String,
      collegeName: String,
      yearOfPassing: Number,
      cgpa: String,
      percentage: String,
      grade: String,
      thesis: {
        title: String,
        description: String,
        guide: String
      },
      projects: [{
        title: String,
        description: String,
        technologies: [String],
        duration: String
      }]
    },
    // Additional Qualifications
    additionalQualifications: [{
      qualificationType: String, // Diploma, Certificate, PhD, etc.
      courseName: String,
      institution: String,
      yearOfCompletion: Number,
      duration: String,
      grade: String,
      description: String
    }],
    // Academic Bank of Credits
    abcId: String
  },
  
  // Complete Work Experience History
  workExperienceHistory: [{
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    department: String,
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
    },
    startDate: { type: Date, required: true },
    endDate: Date,
    isCurrentJob: { type: Boolean, default: false },
    location: String,
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid']
    },
    responsibilities: [String],
    achievements: [String],
    technologies: [String],
    teamSize: String,
    reportingManager: {
      name: String,
      designation: String,
      email: String,
      phone: String
    },
    reasonForLeaving: String,
    salary: {
      amount: String,
      currency: { type: String, default: 'INR' }
    },
    appraisals: [{
      year: Number,
      rating: String,
      comments: String
    }],
    projects: [{
      name: String,
      description: String,
      role: String,
      technologies: [String],
      duration: String,
      teamSize: String,
      achievements: [String]
    }]
  }],
  
  // References
  references: [{
    name: { type: String, required: true },
    designation: { type: String, required: true },
    company: String,
    email: { type: String, required: true },
    phone: String,
    relationship: {
      type: String,
      enum: ['Former Manager', 'Current Manager', 'Colleague', 'HR', 'Client', 'Mentor', 'Academic Reference', 'Other']
    },
    workingRelationship: String, // How they know the candidate
    yearsKnown: String,
    canContact: { type: Boolean, default: true },
    bestTimeToContact: String,
    notes: String,
    referenceType: {
      type: String,
      enum: ['Professional', 'Academic', 'Personal'],
      default: 'Professional'
    }
  }],
  
  // Skills and Certifications
  skillsAndCertifications: {
    technicalSkills: [{
      skillName: String,
      proficiencyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      },
      yearsOfExperience: String,
      lastUsed: String
    }],
    softSkills: [String],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String,
      status: {
        type: String,
        enum: ['Active', 'Expired', 'In Progress'],
        default: 'Active'
      }
    }],
    languages: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Advanced', 'Native']
      },
      canRead: Boolean,
      canWrite: Boolean,
      canSpeak: Boolean
    }]
  },
  
  // Resume Information
  resume: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    extractedText: String,
    aiAnalysis: {
      extractedSkills: [String],
      extractedExperience: String,
      extractedEducation: String,
      extractedCertifications: [String],
      analysisDate: Date,
      confidenceScore: Number
    }
  },
  
  // Social Links and Portfolio
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String,
    personalWebsite: String,
    behance: String,
    dribbble: String
  },
  
  // Background Check Information
  backgroundCheck: {
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Failed'],
      default: 'Not Started'
    },
    lastCheckedDate: Date,
    documents: [{
      type: { type: String }, // Aadhar, PAN, Passport, etc.
      number: String,
      verified: Boolean,
      verificationDate: Date
    }],
    criminalRecord: {
      checked: Boolean,
      status: String,
      date: Date
    },
    addressVerification: {
      status: String,
      verifiedBy: String,
      date: Date
    }
  },
  
  // Career Preferences
  careerPreferences: {
    preferredRoles: [String],
    preferredIndustries: [String],
    preferredLocations: [String],
    preferredWorkMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Any']
    },
    preferredJobTypes: [String],
    preferredCompanySize: {
      type: String,
      enum: ['Startup (1-50)', 'Small (51-200)', 'Medium (201-1000)', 'Large (1000+)', 'Any']
    },
    salaryExpectations: {
      minimum: String,
      maximum: String,
      currency: { type: String, default: 'INR' },
      negotiable: Boolean
    },
    careerGoals: String,
    willingToRelocate: Boolean,
    availabilityToJoin: String
  },
  
  // Metadata and Status
  source: {
    type: String,
    enum: ['Manual Registration', 'Resume Upload', 'ATS Import', 'Referral', 'Job Portal'],
    default: 'Manual Registration'
  },
  applicationHistory: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole'
    },
    appliedDate: Date,
    status: String,
    source: String,
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [String],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastLoginDate: Date,
  profileViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for search and performance (candidateId index is automatic due to unique: true)
candidateProfileSchema.index({ 'personalInfo.email': 1 });
candidateProfileSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
candidateProfileSchema.index({ 'skillsAndCertifications.technicalSkills.skillName': 1 });
candidateProfileSchema.index({ 'professionalInfo.currentRole': 1 });
candidateProfileSchema.index({ 'workExperienceHistory.companyName': 1 });
candidateProfileSchema.index({ createdAt: -1 });
candidateProfileSchema.index({ isActive: 1 });
candidateProfileSchema.index({ profileCompleteness: -1 });

// Calculate profile completeness before saving
candidateProfileSchema.pre('save', function(next) {
  let completeness = 0;
  
  // Personal Info (20%)
  if (this.personalInfo.firstName && this.personalInfo.lastName && this.personalInfo.email && this.personalInfo.phone) {
    completeness += 20;
  }
  
  // Education (20%)
  if (this.educationHistory.graduation.degree || this.educationHistory.tenthGrade.percentage) {
    completeness += 20;
  }
  
  // Work Experience (25%)
  if (this.workExperienceHistory && this.workExperienceHistory.length > 0) {
    completeness += 25;
  }
  
  // Skills (15%)
  if (this.skillsAndCertifications.technicalSkills && this.skillsAndCertifications.technicalSkills.length > 0) {
    completeness += 15;
  }
  
  // Resume (10%)
  if (this.resume && this.resume.fileName) {
    completeness += 10;
  }
  
  // References (10%)
  if (this.references && this.references.length > 0) {
    completeness += 10;
  }
  
  this.profileCompleteness = completeness;
  next();
});

// Generate unique candidate ID before validation
candidateProfileSchema.pre('validate', async function(next) {
  if (this.isNew && !this.candidateId) {
    const year = new Date().getFullYear();
    let attempts = 0;
    let isUnique = false;

    while (!isUnique && attempts < 10) {
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      const generatedId = `CAND-${year}-${randomNum}`;

      const existing = await this.constructor.findOne({ candidateId: generatedId });
      if (!existing) {
        this.candidateId = generatedId;
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      this.candidateId = `CAND-${year}-${Date.now()}`;
    }
  }
  
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model('CandidateProfile', candidateProfileSchema);
