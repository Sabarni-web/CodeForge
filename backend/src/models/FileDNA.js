import mongoose from 'mongoose';

const fileDnaSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    sha256: {
      type: String,
      required: true,
    },
    sha512: {
      type: String,
      required: true,
    },
    astHash: {
      type: String,
      required: true,
    },
    structureHash: {
      type: String,
      required: true,
    },
    styleHash: {
      type: String,
      required: true,
    },
    complexity: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    lineCount: {
      type: Number,
      default: 0,
    },
    imports: [{
      type: String
    }],
    dependencies: [{
      type: String
    }],
    functions: [{
      type: String
    }],
    classes: [{
      type: String
    }],
    styleData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
  }
);

const FileDNA = mongoose.model('FileDNA', fileDnaSchema);
export default FileDNA;
