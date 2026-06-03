import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'applicant'],
    default: 'applicant',
    required: true
  },
  profile: {
    // Personal Information
    phone: String,
    alternatePhone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['', 'Male', 'Female', 'Other', 'Prefer not to say'],
      default: ''
    },
    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    // Professional Information
    bio: String,
    currentCompany: String,
    currentDesignation: String,
    totalExperience: String,
    relevantExperience: String,
    skills: [String],
    expectedSalary: String,
    currentSalary: String,
    noticePeriod: String,
    workAuthorization: String,
    availability: String,
    preferredLocation: [String],
    workPreferences: [String],
    // Academic Information
    education: String,
    degree: String,
    university: String,
    graduationYear: Number,
    gpa: String,
    abcId: String,
    // Additional Information
    certifications: [String],
    languages: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Conversational', 'Proficient', 'Advanced', 'Native']
      }
    }],
    // Social Links
    linkedIn: String,
    portfolio: String,
    github: String,
    // Resume
    resume: {
      fileName: String,
      fileUrl: String,
      uploadDate: Date
    },
    // Profile Picture
    profilePicture: {
      fileName: String,
      fileUrl: String,
      uploadDate: Date
    },
    // Legal and Consent
    consents: {
      dataProcessing: {
        type: Boolean,
        default: false
      },
      backgroundVerification: {
        type: Boolean,
        default: false
      },
      contactConsent: {
        type: Boolean,
        default: false
      },
      thirdPartySharing: {
        type: Boolean,
        default: false
      },
      marketingCommunication: {
        type: Boolean,
        default: false
      },
      consentDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  applications: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    },
    coverLetter: String,
    resumeSnapshot: String // Store resume content at time of application
  }],
  profileViews: {
    type: Number,
    default: 0
  },
  refreshToken: String
}, {
  timestamps: true
});

// Index for performance (email index is automatic due to unique: true)
userSchema.index({ role: 1 });
userSchema.index({ 'applications.jobId': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// JSON transformation to hide sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);