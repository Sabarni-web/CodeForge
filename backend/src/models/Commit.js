import mongoose from 'mongoose';

const commitSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
      index: true,
    },
    shortHash: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Commit message is required'],
      trim: true,
      maxlength: [500, 'Commit message cannot exceed 500 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    files: [
      {
        file: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'File',
        },
        action: {
          type: String,
          enum: ['added', 'modified', 'deleted'],
          default: 'added',
        },
        filePath: {
          type: String,
        },
      },
    ],
    addedFiles: {
      type: [String],
      default: [],
    },
    modifiedFiles: {
      type: [String],
      default: [],
    },
    deletedFiles: {
      type: [String],
      default: [],
    },
    totalChangedFiles: {
      type: Number,
      default: 0,
    },
    parentCommit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commit',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching commit history of a repo sorted by date
commitSchema.index({ repository: 1, createdAt: -1 });

const Commit = mongoose.model('Commit', commitSchema);
export default Commit;
