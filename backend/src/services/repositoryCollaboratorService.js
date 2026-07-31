import Repository from '../models/Repository.js';
import RepositoryCollaborator from '../models/RepositoryCollaborator.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';

/**
 * Invite a user to a repository
 */
export const inviteUser = async (repositoryId, username, role, invitedById) => {
  const repo = await Repository.findById(repositoryId);
  if (!repo) {
    const err = new Error('Repository not found');
    err.statusCode = 404;
    throw err;
  }

  // Find user case-insensitively
  const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Prevent inviting self
  if (user._id.toString() === invitedById.toString()) {
    const err = new Error('You cannot invite yourself');
    err.statusCode = 400;
    throw err;
  }

  // Prevent inviting the owner
  if (user._id.toString() === repo.owner.toString()) {
    const err = new Error('User is already the owner of this repository');
    err.statusCode = 400;
    throw err;
  }

  // Check if already a collaborator or pending
  const existingCollab = await RepositoryCollaborator.findOne({
    repository: repositoryId,
    user: user._id,
  });

  let collabId;

  if (existingCollab) {
    if (existingCollab.status === 'Pending') {
      const err = new Error('An invitation is already pending for this user');
      err.statusCode = 400;
      throw err;
    }
    if (existingCollab.status === 'Accepted') {
      const err = new Error('User is already a collaborator');
      err.statusCode = 400;
      throw err;
    }
    // If rejected or removed previously, we reset to Pending and update role
    existingCollab.status = 'Pending';
    existingCollab.role = role;
    existingCollab.invitedBy = invitedById;
    await existingCollab.save();
    collabId = existingCollab._id;
  } else {
    const newCollab = await RepositoryCollaborator.create({
      repository: repositoryId,
      user: user._id,
      role,
      status: 'Pending',
      invitedBy: invitedById,
    });
    collabId = newCollab._id;
  }

  // Create real-time notification
  const inviter = await User.findById(invitedById).lean();
  await createNotification({
    recipient: user._id,
    sender: invitedById,
    message: `${inviter.username} invited you to collaborate on ${repo.name} as a ${role}`,
    type: 'REPOSITORY_INVITATION',
    link: `/repos/${repo._id}?invitationId=${collabId}`, // Redirect link with invitation ID
  });

  return { success: true, message: 'Invitation sent successfully' };
};

/**
 * Accept invitation
 */
export const acceptInvitation = async (invitationId, userId) => {
  const invitation = await RepositoryCollaborator.findOne({ _id: invitationId, user: userId });
  if (!invitation) {
    const err = new Error('Invitation not found');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.status !== 'Pending') {
    const err = new Error('Invitation is no longer pending');
    err.statusCode = 400;
    throw err;
  }

  invitation.status = 'Accepted';
  invitation.acceptedAt = new Date();
  await invitation.save();

  // Add to Repository collaborators list
  const repo = await Repository.findById(invitation.repository);
  if (repo) {
    if (!repo.collaborators.includes(userId)) {
      repo.collaborators.push(userId);
      await repo.save();
    }

    // Notify the inviter
    const invitee = await User.findById(userId).lean();
    await createNotification({
      recipient: invitation.invitedBy,
      sender: userId,
      message: `${invitee.username} accepted your invitation to collaborate on ${repo.name}`,
      type: 'INVITATION_ACCEPTED',
      link: `/repos/${repo._id}`,
    });
  }

  return invitation;
};

/**
 * Reject invitation
 */
export const rejectInvitation = async (invitationId, userId) => {
  const invitation = await RepositoryCollaborator.findOne({ _id: invitationId, user: userId });
  if (!invitation) {
    const err = new Error('Invitation not found');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.status !== 'Pending') {
    const err = new Error('Invitation is no longer pending');
    err.statusCode = 400;
    throw err;
  }

  invitation.status = 'Rejected';
  await invitation.save();

  // Notify the inviter
  const repo = await Repository.findById(invitation.repository).lean();
  if (repo) {
    const invitee = await User.findById(userId).lean();
    await createNotification({
      recipient: invitation.invitedBy,
      sender: userId,
      message: `${invitee.username} declined your invitation to collaborate on ${repo.name}`,
      type: 'INVITATION_REJECTED',
      link: `/repos/${repo._id}`,
    });
  }

  return { success: true, message: 'Invitation declined' };
};

/**
 * Remove collaborator
 */
export const removeCollaborator = async (repositoryId, collaboratorId, removedById) => {
  const repo = await Repository.findById(repositoryId);
  if (!repo) {
    const err = new Error('Repository not found');
    err.statusCode = 404;
    throw err;
  }

  // Remove from collaborators array
  repo.collaborators = repo.collaborators.filter(id => id.toString() !== collaboratorId.toString());
  await repo.save();

  // Update collaborator record status
  await RepositoryCollaborator.findOneAndUpdate(
    { repository: repositoryId, user: collaboratorId },
    { status: 'Removed' }
  );

  // Notify user
  const remover = await User.findById(removedById).lean();
  await createNotification({
    recipient: collaboratorId,
    sender: removedById,
    message: `${remover.username} removed you from the repository ${repo.name}`,
    type: 'REMOVED_FROM_REPOSITORY',
    link: `/repos`,
  });

  return { success: true, message: 'Collaborator removed successfully' };
};

/**
 * Transfer Ownership
 */
export const transferOwnership = async (repositoryId, newOwnerUsername, currentOwnerId) => {
  const repo = await Repository.findById(repositoryId);
  if (!repo) {
    const err = new Error('Repository not found');
    err.statusCode = 404;
    throw err;
  }

  if (repo.owner.toString() !== currentOwnerId.toString()) {
    const err = new Error('Unauthorized — Only the repository owner can transfer ownership');
    err.statusCode = 403;
    throw err;
  }

  const newOwner = await User.findOne({ username: { $regex: new RegExp(`^${newOwnerUsername}$`, 'i') } });
  if (!newOwner) {
    const err = new Error('Target user not found');
    err.statusCode = 404;
    throw err;
  }

  if (newOwner._id.toString() === currentOwnerId.toString()) {
    const err = new Error('You are already the owner of this repository');
    err.statusCode = 400;
    throw err;
  }

  // Transfer owner
  repo.owner = newOwner._id;
  // Remove new owner from collaborators list if present
  repo.collaborators = repo.collaborators.filter(id => id.toString() !== newOwner._id.toString());
  // Add previous owner as Maintainer collaborator
  if (!repo.collaborators.includes(currentOwnerId)) {
    repo.collaborators.push(currentOwnerId);
  }
  await repo.save();

  // Update RepositoryCollaborator collection
  await RepositoryCollaborator.findOneAndDelete({ repository: repositoryId, user: newOwner._id });
  await RepositoryCollaborator.findOneAndUpdate(
    { repository: repositoryId, user: currentOwnerId },
    { role: 'Maintainer', status: 'Accepted' },
    { upsert: true }
  );

  // Notify new owner
  const oldOwner = await User.findById(currentOwnerId).lean();
  await createNotification({
    recipient: newOwner._id,
    sender: currentOwnerId,
    message: `${oldOwner.username} transferred ownership of repository ${repo.name} to you`,
    type: 'TRANSFERRED_OWNERSHIP',
    link: `/repos/${repo._id}`,
  });

  return { success: true, message: 'Ownership transferred successfully' };
};

/**
 * Get Repository Members (Owner + accepted Collaborators)
 */
export const getMembers = async (repositoryId) => {
  const repo = await Repository.findById(repositoryId).populate('owner', 'username avatar displayName email').lean();
  if (!repo) {
    const err = new Error('Repository not found');
    err.statusCode = 404;
    throw err;
  }

  const collabs = await RepositoryCollaborator.find({ repository: repositoryId })
    .populate('user', 'username avatar displayName email')
    .lean();

  return {
    owner: repo.owner,
    collaborators: collabs,
  };
};
