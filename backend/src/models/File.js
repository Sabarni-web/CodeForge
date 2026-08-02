import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'File path is required'],
      trim: true,
    },
    content: {
      type: Buffer,
      default: Buffer.from(''),
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    lastCommit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commit',
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'text/plain',
    },
    isDirectory: {
      type: Boolean,
      default: false,
    },
    hash: {
      type: String,
      default: '',
    },
    version: {
      type: Number,
      default: 1,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique file path per repository
fileSchema.index({ path: 1, repository: 1 }, { unique: true });

const File = mongoose.model('File', fileSchema);
export default File;
