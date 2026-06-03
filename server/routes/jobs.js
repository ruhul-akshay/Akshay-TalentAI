
import express from 'express';
import JobRole from '../models/JobRole.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all jobs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, department, experienceLevel } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    const jobs = await JobRole.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await JobRole.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Increment view count
    await JobRole.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user._id,
      status: req.body.status || 'draft'
    };

    const job = new JobRole(jobData);
    await job.save();

    const populatedJob = await JobRole.findById(job._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update job
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedJob = await JobRole.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        updatedBy: req.user._id,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update job status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'paused', 'closed', 'draft'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const updatedJob = await JobRole.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedBy: req.user._id,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete job
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await JobRole.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get job statistics
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalJobs = await JobRole.countDocuments();
    const activeJobs = await JobRole.countDocuments({ status: 'active' });
    const draftJobs = await JobRole.countDocuments({ status: 'draft' });
    const closedJobs = await JobRole.countDocuments({ status: 'closed' });
    
    // Get jobs by department
    const jobsByDepartment = await JobRole.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent jobs
    const recentJobs = await JobRole.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        draftJobs,
        closedJobs,
        jobsByDepartment,
        recentJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
