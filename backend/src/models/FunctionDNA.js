import mongoose from 'mongoose';

const functionDnaSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    functionName: {
      type: String,
      required: true,
    },
    functionHash: {
      type: String,
      required: true,
    },
    signatureHash: {
      type: String,
      required: true,
    },
    complexity: {
      type: Number,
      default: 0,
    },
    dependencyHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FunctionDNA = mongoose.model('FunctionDNA', functionDnaSchema);
export default FunctionDNA;
