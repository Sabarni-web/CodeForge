import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
      maxlength: [100, 'Repository name cannot exceed 100 characters'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Repo name can only contain letters, numbers, dots, hyphens, and underscores'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    topics: {
      type: [String],
      default: [],
    },
    readme: {
      type: String,
      default: '',
    },
    license: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    forkCount: {
      type: Number,
      default: 0,
    },
    watchCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    allowIssues: {
      type: Boolean,
      default: true,
    },
    allowDiscussions: {
      type: Boolean,
      default: true,
    },
    allowPullRequests: {
      type: Boolean,
      default: true,
    },
    stars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    defaultBranch: {
      type: String,
      default: 'main',
    },
    language: {
      type: String,
      default: '',
    },
    // Fork System Extensions
    isFork: {
      type: Boolean,
      default: false,
    },
    forkParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      default: null,
    },
    forkRoot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      default: null,
    },
    forkDepth: {
      type: Number,
      default: 0,
    },
    forkCreatedAt: {
      type: Date,
    },
    lastSyncAt: {
      type: Date,
    },
    allowSync: {
      type: Boolean,
      default: true,
    },
    forkSourceOwner: {
      type: String,
      default: '',
    },
    forkSourceRepository: {
      type: String,
      default: '',
    },
    // Sync System Extensions
    totalVersions: {
      type: Number,
      default: 1,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    // Guardian System Extensions
    guardianEnabled: {
      type: Boolean,
      default: true,
    },
    guardianCreatedAt: {
      type: Date,
    },
    guardianVersion: {
      type: String,
      default: '1.0.0',
    },
    certificateId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep isPrivate and visibility in sync, and update starCount
repositorySchema.pre('save', function (next) {
  if (this.isModified('visibility')) {
    this.isPrivate = this.visibility === 'private';
  } else if (this.isModified('isPrivate')) {
    this.visibility = this.isPrivate ? 'private' : 'public';
  }
  if (this.isModified('stars') || this.isNew) {
    this.starCount = this.stars ? this.stars.length : 0;
  }
  next();
});

// Virtual for star count
repositorySchema.virtual('starCount').get(function () {
  return this.stars ? this.stars.length : 0;
});

// Compound index: unique repo name per owner
repositorySchema.index({ name: 1, owner: 1 }, { unique: true });

// Extra performance indexes
repositorySchema.index({ visibility: 1 });
repositorySchema.index({ language: 1 });
repositorySchema.index({ topics: 1 });
repositorySchema.index({ collaborators: 1 });
repositorySchema.index({ name: 1 });
repositorySchema.index({ forkParent: 1 });
repositorySchema.index({ forkRoot: 1 });
repositorySchema.index({ forkCount: -1 });
repositorySchema.index({ isFork: 1 });

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;
