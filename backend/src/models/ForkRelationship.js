import mongoose from 'mongoose';

const forkRelationshipSchema = new mongoose.Schema(
  {
    parentRepository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    childRepository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    forkOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    forkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    forkedAt: {
      type: Date,
      default: Date.now,
    },
    syncEnabled: {
      type: Boolean,
      default: true,
    },
    lastSync: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookup of specific fork relationship
forkRelationshipSchema.index({ parentRepository: 1, childRepository: 1 }, { unique: true });
// Index for finding all forks of a user
forkRelationshipSchema.index({ forkOwner: 1 });

const ForkRelationship = mongoose.model('ForkRelationship', forkRelationshipSchema);
export default ForkRelationship;
