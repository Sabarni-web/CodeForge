import Repository from '../models/Repository.js';
import RepositoryCollaborator from '../models/RepositoryCollaborator.js';

/**
 * Get user's active collaborator role for a repository
 * @param {string} repositoryId
 * @param {string} userId
 * @returns {Promise<string|null>} Role or null if not a collaborator
 */
export const getCollaboratorRole = async (repositoryId, userId) => {
  if (!userId) return null;

  // Check if owner
  const repo = await Repository.findById(repositoryId).select('owner').lean();
  if (!repo) return null;
  if (repo.owner.toString() === userId.toString()) {
    return 'Owner';
  }

  // Check collaborator list (only accepted status is active)
  const collab = await RepositoryCollaborator.findOne({
    repository: repositoryId,
    user: userId,
    status: 'Accepted'
  }).lean();

  return collab ? collab.role : null;
};

/**
 * Check if user can read the repository (Public or authorized Collaborator)
 * @param {string} repositoryId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const hasAccess = async (repositoryId, userId) => {
  const repo = await Repository.findById(repositoryId).select('owner isPrivate visibility').lean();
  if (!repo) return false;

  const visibilityStr = repo.visibility || (repo.isPrivate ? 'private' : 'public');

  if (visibilityStr === 'public') {
    return true;
  }

  if (!userId) return false;

  // Owner always has access
  if (repo.owner.toString() === userId.toString()) {
    return true;
  }

  // Check accepted collaborator
  const collab = await RepositoryCollaborator.findOne({
    repository: repositoryId,
    user: userId,
    status: 'Accepted'
  }).lean();

  return !!collab;
};

/**
 * Check if user has specific roles on a repository
 * @param {string} repositoryId
 * @param {string} userId
 * @param {string[]} allowedRoles - List of allowed roles (e.g. ['Owner', 'Maintainer'])
 * @returns {Promise<boolean>}
 */
export const hasRole = async (repositoryId, userId, allowedRoles) => {
  if (!userId) return false;

  const role = await getCollaboratorRole(repositoryId, userId);
  if (!role) return false;

  // Owner is always allowed everything
  if (role === 'Owner') return true;

  return allowedRoles.includes(role);
};
