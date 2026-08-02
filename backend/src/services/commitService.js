import Commit from '../models/Commit.js';
import { createCommitHash } from '../utils/hashGenerator.js';

/**
 * Create a new commit
 * @param {object} params
 * @param {string} params.message - Commit message
 * @param {string} params.authorId - Author's user ID
 * @param {string} params.repoId - Repository ID
 * @param {Array} params.files - Array of { file, action, filePath }
 * @returns {Promise<object>} Created commit document
 */
export const createCommit = async ({ message, authorId, repoId, files = [], branch = 'main' }) => {
  // Generate unique hash
  const { hash, shortHash } = createCommitHash({
    message,
    authorId,
    repoId,
  });

  // Find the latest commit for this repo and branch (to set as parent)
  const latestCommit = await Commit.findOne({ repository: repoId, branch })
    .sort({ createdAt: -1 })
    .lean();

  const commit = await Commit.create({
    hash,
    shortHash,
    message,
    author: authorId,
    repository: repoId,
    files,
    branch,
    parentCommit: latestCommit?._id || null,
  });

  return commit;
};

/**
 * Get commit history for a repository
 * @param {string} repoId - Repository ID
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of commits per page
 * @returns {Promise<{ commits: Array, total: number, page: number, totalPages: number }>}
 */
export const getCommitHistory = async (repoId, page = 1, limit = 20, branch = 'main') => {
  const skip = (page - 1) * limit;

  const [commits, total] = await Promise.all([
    Commit.find({ repository: repoId, branch })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean(),
    Commit.countDocuments({ repository: repoId, branch }),
  ]);

  return {
    commits,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a single commit by ID
 * @param {string} commitId - Commit ID
 * @returns {Promise<object>}
 */
export const getCommitById = async (commitId) => {
  const commit = await Commit.findById(commitId)
    .populate('author', 'username avatar')
    .populate('files.file', 'name path')
    .lean();

  return commit;
};
