
import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRole',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can't save the same job multiple times
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model('SavedJob', savedJobSchema);
