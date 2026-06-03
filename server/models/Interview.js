
import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication',
    required: true
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
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // minutes
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'in-person', 'technical'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  interviewer: {
    name: String,
    email: String,
    role: String
  },
  meetingLink: String,
  location: String,
  notes: String,
  feedback: String
}, {
  timestamps: true
});

// Indexes
interviewSchema.index({ applicant: 1 });
interviewSchema.index({ scheduledDate: 1 });

export default mongoose.model('Interview', interviewSchema);
