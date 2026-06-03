import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import JobApplication from '../models/JobApplication.js';
import SavedJob from '../models/SavedJob.js';
import Interview from '../models/Interview.js';
import JobRole from '../models/JobRole.js';
import User from '../models/User.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/resumes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure multer for profile picture uploads
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/profile-pictures');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
    }
  }
});

// Get dashboard stats for job seeker
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts
    const appliedJobs = await JobApplication.countDocuments({ applicant: userId });
    const interviews = await JobApplication.countDocuments({ 
      applicant: userId, 
      status: { $in: ['interview-scheduled', 'shortlisted'] }
    });

    // Calculate profile views (placeholder - would need tracking implementation)
    const profileViews = req.user.profileViews || 0;

    res.json({
      success: true,
      data: {
        appliedJobs,
        savedJobs: 0, // Placeholder for saved jobs functionality
        interviews,
        profileViews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get applied jobs
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user._id })
      .populate('job', 'title department location salaryRange')
      .sort({ createdAt: -1 });

    const formattedApplications = applications.map(app => ({
      id: app._id,
      job: app.job?.title || 'Unknown Position',
      company: app.job?.department || 'TechCorp',
      location: app.job?.location || 'Location not specified',
      status: app.status,
      appliedDate: app.createdAt,
      statusColor: getStatusColor(app.status),
      jobId: app.job?._id,
      salary: app.job?.salaryRange
    }));

    res.json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get saved jobs
router.get('/saved-jobs', authenticateToken, async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate('job', 'title department location salaryRange createdAt status')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedJobs = savedJobs.map(saved => ({
      id: saved._id,
      jobId: saved.job._id,
      title: saved.job.title,
      company: saved.job.department,
      location: saved.job.location,
      salary: saved.job.salaryRange,
      savedDate: saved.savedDate,
      status: saved.job.status
    }));

    res.json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get interviews
router.get('/interviews', authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({ applicant: req.user._id })
      .populate('job', 'title department')
      .populate('application', 'status')
      .sort({ scheduledDate: 1 });

    const formattedInterviews = interviews.map(interview => ({
      id: interview._id,
      job: interview.job.title,
      company: interview.job.department,
      scheduledDate: interview.scheduledDate,
      duration: interview.duration,
      type: interview.type,
      status: interview.status,
      interviewer: interview.interviewer,
      meetingLink: interview.meetingLink,
      location: interview.location,
      notes: interview.notes
    }));

    res.json({
      success: true,
      data: formattedInterviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Profile picture upload endpoint
router.post('/upload-profile-picture', authenticateToken, (req, res, next) => {
  console.log('Profile picture upload middleware called');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('User ID:', req.user?._id);
  
  uploadProfilePicture.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    console.log('Multer processing completed');
    next();
  });
}, async (req, res) => {
  try {
    console.log('Profile picture upload request received');
    console.log('File:', req.file);
    console.log('User:', req.user._id);
    console.log('Body:', req.body);

    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({
        success: false,
        error: 'No profile picture uploaded'
      });
    }

    // Generate full URL for profile picture
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.SERVER_URL || `https://${req.get('host')}` 
      : `http://localhost:${process.env.PORT || 8000}`;
    
    const profilePictureData = {
      fileName: req.file.originalname,
      fileUrl: `${baseUrl}/uploads/profile-pictures/${req.file.filename}`,
      uploadDate: new Date()
    };

    console.log('Profile picture data prepared:', profilePictureData);

    // Update user profile with profile picture info
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.profilePicture': profilePictureData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    console.log('Profile picture uploaded successfully:', profilePictureData);
    console.log('User updated:', updatedUser?._id);

    res.json({
      success: true,
      data: {
        profilePicture: profilePictureData,
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resume upload endpoint
router.post('/upload-resume', authenticateToken, (req, res, next) => {
  console.log('Resume upload middleware called');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('User ID:', req.user?._id);
  
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    console.log('Multer processing completed for resume');
    next();
  });
}, async (req, res) => {
  try {
    console.log('Resume upload request received');
    console.log('File:', req.file);
    console.log('User:', req.user._id);
    console.log('Body:', req.body);

    if (!req.file) {
      console.log('No resume file found in request');
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    // Generate full URL for resume
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.SERVER_URL || `https://${req.get('host')}` 
      : `http://localhost:${process.env.PORT || 8000}`;
    
    const resumeData = {
      fileName: req.file.originalname,
      fileUrl: `${baseUrl}/uploads/resumes/${req.file.filename}`,
      uploadDate: new Date()
    };

    console.log('Resume data prepared:', resumeData);

    // Update user profile with resume info
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.resume': resumeData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    console.log('Resume uploaded successfully:', resumeData);
    console.log('User updated:', updatedUser?._id);

    res.json({
      success: true,
      data: {
        resume: resumeData,
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      alternatePhone,
      dateOfBirth,
      gender,
      address,
      bio,
      skills,
      experience,
      education,
      linkedIn,
      portfolio,
      github,
      // Professional fields
      currentCompany,
      currentDesignation,
      expectedSalary,
      currentSalary,
      noticePeriod,
      workAuthorization,
      availability,
      totalExperience,
      relevantExperience,
      preferredLocation,
      workPreferences,
      // Academic fields
      degree,
      university,
      graduationYear,
      gpa,
      abcId,
      // Additional fields
      certifications,
      languages,
      // Consent fields
      consents
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        'profile.phone': phone,
        'profile.alternatePhone': alternatePhone,
        'profile.dateOfBirth': dateOfBirth,
        'profile.gender': gender,
        'profile.address': address,
        'profile.bio': bio,
        'profile.skills': skills,
        'profile.experience': experience,
        'profile.education': education,
        'profile.linkedIn': linkedIn,
        'profile.portfolio': portfolio,
        'profile.github': github,
        'profile.currentCompany': currentCompany,
        'profile.currentDesignation': currentDesignation,
        'profile.expectedSalary': expectedSalary,
        'profile.currentSalary': currentSalary,
        'profile.noticePeriod': noticePeriod,
        'profile.workAuthorization': workAuthorization,
        'profile.availability': availability,
        'profile.totalExperience': totalExperience,
        'profile.relevantExperience': relevantExperience,
        'profile.preferredLocation': preferredLocation,
        'profile.workPreferences': workPreferences,
        'profile.degree': degree,
        'profile.university': university,
        'profile.graduationYear': graduationYear,
        'profile.gpa': gpa,
        'profile.abcId': abcId,
        'profile.certifications': certifications,
        'profile.languages': languages,
        'profile.consents': consents
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apply to a job
router.post('/apply/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user._id;

    // Check if job exists
    const job = await JobRole.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      applicant: userId,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this job'
      });
    }

    // Create application
    const application = new JobApplication({
      applicant: userId,
      job: jobId,
      coverLetter,
      status: 'pending'
    });

    await application.save();

    // Update job application count
    await JobRole.findByIdAndUpdate(jobId, {
      $inc: { applications: 1 }
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save/unsave a job
router.post('/save-job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Check if job exists
    const job = await JobRole.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      user: userId,
      job: jobId
    });

    if (existingSave) {
      // Unsave
      await SavedJob.deleteOne({ _id: existingSave._id });
      res.json({
        success: true,
        data: { action: 'unsaved' }
      });
    } else {
      // Save
      const savedJob = new SavedJob({
        user: userId,
        job: jobId
      });
      await savedJob.save();
      res.json({
        success: true,
        data: { action: 'saved' }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to get status color
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pending': return 'blue';
    case 'reviewing': return 'yellow';
    case 'shortlisted': return 'green';
    case 'interview-scheduled': return 'purple';
    case 'rejected': return 'red';
    case 'hired': return 'green';
    default: return 'gray';
  }
}

export default router;