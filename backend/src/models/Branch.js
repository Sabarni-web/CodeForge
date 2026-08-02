import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [100, 'Branch name cannot exceed 100 characters'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Branch name can only contain letters, numbers, dots, hyphens, and underscores'],
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    headCommit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commit',
    }
  },
  {
    timestamps: true,
  }
);

// Branch names must be unique per repository
branchSchema.index({ repository: 1, name: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
