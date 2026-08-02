import mongoose from 'mongoose';

const repositoryDnaSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    repositoryHash: {
      type: String,
      required: true,
    },
    repositoryStructureHash: {
      type: String,
      required: true,
    },
    complexityScore: {
      type: Number,
      default: 0,
    },
    languageDistribution: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const RepositoryDNA = mongoose.model('RepositoryDNA', repositoryDnaSchema);
export default RepositoryDNA;
