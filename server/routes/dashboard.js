
import express from 'express';
import JobApplication from '../models/JobApplication.js';
import JobRole from '../models/JobRole.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getActivityAction, 
  getActivityType, 
  getActivityIcon, 
  getActivityPriority, 
  formatCandidateStatus, 
  getRandomAvatar, 
  getTimeAgo,
  formatSalary,
  formatExperience,
  extractExperienceYears,
  isCandidateFresher,
  generateMockPhone,
  generateNoticePeriod,
  extractCurrentCompany,
  generateTotalExperience,
  generateRelevantExperience,
  generateDegree,
  generateUniversity,
  generateGraduationYear,
  generateGPA,
  generateABCId,
  extractPreviousCompany
} from '../utils/helpers.js';

const router = express.Router();

// Dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalApplications = await JobApplication.countDocuments();
    const processed = await JobApplication.countDocuments({ status: { $nin: ["pending"] } });
    const matched = await JobApplication.countDocuments({ status: { $in: ["interview-scheduled", "hired", "shortlisted"] } });
    const pending = await JobApplication.countDocuments({ status: "pending" });
    const activeJobs = await JobRole.countDocuments({ status: "active", isActive: true });
    const interviewsScheduled = await JobApplication.countDocuments({ status: "interview-scheduled" });
    const hiredCandidates = await JobApplication.countDocuments({ status: "hired" });

    res.json({
      success: true,
      data: {
        totalResumes: totalApplications,
        processed,
        matched,
        pending,
        activeJobs,
        totalApplications,
        interviewsScheduled,
        hiredCandidates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const recentApplications = await JobApplication.find()
      .populate("applicant", "firstName lastName")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentApplications.map((app) => ({
      id: app._id,
      action: getActivityAction(app.status),
      candidate: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : "Unknown",
      job: app.job ? app.job.title : "Unknown Position",
      time: getTimeAgo(app.createdAt),
      type: getActivityType(app.status),
      icon: getActivityIcon(app.status),
      priority: getActivityPriority(app.status),
      score: app.status === "shortlisted" ? Math.floor(Math.random() * 20) + 80 : null,
    }));

    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Top candidates
router.get('/candidates', authenticateToken, async (req, res) => {
  try {
    const topCandidates = await JobApplication.find({
      status: { $in: ["shortlisted", "interview-scheduled", "hired"] },
    })
      .populate("applicant", "firstName lastName profile")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    const candidates = topCandidates.map((app) => ({
      name: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : "Unknown",
      match: app.aiAnalysis?.matchPercentage || Math.floor(Math.random() * 20) + 80,
      skills: app.applicant?.profile?.skills || app.aiAnalysis?.matchingSkills || ["JavaScript", "React", "Node.js"],
      status: formatCandidateStatus(app.status),
      avatar: getRandomAvatar(),
      position: app.job ? app.job.title : "Unknown Position",
      experience: app.applicant?.profile?.experience || "5+ years",
      location: app.applicant?.profile?.location || "Remote",
    }));

    res.json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Jobs overview
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await JobRole.find({ isActive: true, status: "active" })
      .sort({ createdAt: -1 })
      .limit(10);

    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await JobApplication.countDocuments({ job: job._id });
        return {
          id: job._id,
          title: job.title,
          applications: applicationCount,
          views: job.views || Math.floor(Math.random() * 200) + 50,
          status: job.status,
          urgency: job.urgency || "medium",
          department: job.department,
          daysOpen: Math.floor((Date.now() - job.createdAt) / (1000 * 60 * 60 * 24)),
        };
      })
    );

    res.json({ success: true, data: jobsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
