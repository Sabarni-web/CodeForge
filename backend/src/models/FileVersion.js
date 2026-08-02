import mongoose from 'mongoose';

const fileVersionSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    content: {
      type: Buffer,
      default: Buffer.from(''),
    },
    commit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commit',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying specific version
fileVersionSchema.index({ file: 1, versionNumber: 1 }, { unique: true });

const FileVersion = mongoose.model('FileVersion', fileVersionSchema);
export default FileVersion;
