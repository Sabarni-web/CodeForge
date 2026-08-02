import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['FOLLOW_REQUEST', 'FOLLOW_ACCEPTED', 'FOLLOW_REJECTED', 'REPOSITORY_STAR', 'COMMENT', 'SYSTEM', 'REPOSITORY_INVITATION', 'INVITATION_ACCEPTED', 'INVITATION_REJECTED', 'REMOVED_FROM_REPOSITORY', 'TRANSFERRED_OWNERSHIP', 'REPOSITORY_FORKED', 'FORK_MILESTONE', 'GUARDIAN_ENABLED', 'GUARDIAN_DISABLED', 'CERTIFICATE_CREATED', 'DNA_GENERATED', 'DNA_UPDATED', 'VERIFICATION_COMPLETED', 'HIGH_SIMILARITY_FOUND'],
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
