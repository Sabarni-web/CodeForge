import mongoose from 'mongoose';

const guardianAnalyticsSchema = new mongoose.Schema({
  singletonId: {
    type: String,
    default: 'global_guardian_analytics',
    unique: true
  },
  repositoriesProtected: {
    type: Number,
    default: 0
  },
  filesProtected: {
    type: Number,
    default: 0
  },
  certificatesGenerated: {
    type: Number,
    default: 0
  },
  guardianEnabledUsers: {
    type: Number,
    default: 0
  },
  verificationRequests: {
    type: Number,
    default: 0
  },
  successfulMatches: {
    type: Number,
    default: 0
  },
  averageSimilarity: {
    type: Number,
    default: 0
  },
  mostVerifiedRepository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    default: null
  },
  mostProtectedRepository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    default: null
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

const GuardianAnalytics = mongoose.model('GuardianAnalytics', guardianAnalyticsSchema);
export default GuardianAnalytics;
