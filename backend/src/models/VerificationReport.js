import mongoose from 'mongoose';

const verificationReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repositoryMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      default: null,
    },
    ownerMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    similarityScore: {
      type: Number,
      required: true,
      default: 0,
    },
    structureScore: {
      type: Number,
      required: true,
      default: 0,
    },
    styleScore: {
      type: Number,
      required: true,
      default: 0,
    },
    functionScore: {
      type: Number,
      required: true,
      default: 0,
    },
    complexityScore: {
      type: Number,
      required: true,
      default: 0,
    },
    certificateDetected: {
      type: Boolean,
      default: false,
    },
    guardianProtected: {
      type: Boolean,
      default: false,
    },
    matchedFiles: [
      {
        path: String,
        similarity: Number,
        matchedWith: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const VerificationReport = mongoose.model('VerificationReport', verificationReportSchema);
export default VerificationReport;
