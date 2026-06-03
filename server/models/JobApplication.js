import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    unique: true,
    required: false
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRole',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  resumeFile: {
    fileName: String,
    fileContent: String, // Store the resume content for analysis
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  aiAnalysis: {
    matchPercentage: Number,
    matchingSkills: [String],
    missingSkills: [String],
    experienceMatch: String,
    educationRelevance: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    overallAssessment: String,
    interviewReadiness: String,
    analysisDate: Date
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  interviewDetails: {
    scheduledDate: Date,
    location: String,
    interviewType: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical']
    },
    interviewer: String,
    feedback: String
  },
  applicationSource: {
    type: String,
    enum: ['LinkedIn', 'Naukri', 'Glassdoor', 'Direct Application', 'Indeed', 'Monster', 'Company Website', 'Referral', 'Campus Placement', 'Walk-in', 'Email', 'Other'],
    default: 'Direct Application'
  },
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
    yearsKnown: String,
    canContact: { type: Boolean, default: true },
    contactedDate: Date,
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  hiringDetails: {
    hiringCompany: String,
    hiringDepartment: String,
    positionAppliedFor: String,
    offerStatus: {
      type: String,
      enum: ['Not Offered', 'Offer Extended', 'Offer Accepted', 'Offer Declined', 'Negotiating'],
      default: 'Not Offered'
    },
    offerDate: Date,
    joiningDate: Date,
    offeredSalary: String,
    offeredDesignation: String
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
jobApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true }); // Prevent duplicate applications
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ applicant: 1 });
jobApplicationSchema.index({ createdAt: -1 });

// Generate unique candidateId and add status to history before saving
jobApplicationSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.candidateId) {
      // Generate unique candidate ID like "CAND-2024-001"
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
        // Fallback with timestamp
        this.candidateId = `CAND-${year}-${Date.now()}`;
      }
    }

    // Ensure candidateId exists before saving
    if (!this.candidateId) {
      const year = new Date().getFullYear();
      this.candidateId = `CAND-${year}-${Date.now()}`;
    }
    
    if (this.isModified('status') && !this.isNew) {
      this.statusHistory.push({
        status: this.status,
        changedAt: new Date()
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('JobApplication', jobApplicationSchema);