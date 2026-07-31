import mongoose from 'mongoose';

const repositoryCollaboratorSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['Owner', 'Maintainer', 'Contributor', 'Viewer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Removed'],
      default: 'Pending',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique collaborator state per repository and user
repositoryCollaboratorSchema.index({ repository: 1, user: 1 }, { unique: true });

const RepositoryCollaborator = mongoose.model('RepositoryCollaborator', repositoryCollaboratorSchema);
export default RepositoryCollaborator;
