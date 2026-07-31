import crypto from 'crypto';

/**
 * Generate a SHA-1 hash for a commit
 * @param {string} content - Content to hash (commit message + timestamp + author)
 * @returns {{ hash: string, shortHash: string }}
 */
export const generateCommitHash = (content) => {
  const hash = crypto.createHash('sha1').update(content).digest('hex');
  return {
    hash,
    shortHash: hash.substring(0, 7),
  };
};

/**
 * Generate a unique hash from multiple fields
 * @param {object} params
 * @param {string} params.message - Commit message
 * @param {string} params.authorId - Author's user ID
 * @param {string} params.repoId - Repository ID
 * @returns {{ hash: string, shortHash: string }}
 */
export const createCommitHash = ({ message, authorId, repoId }) => {
  const content = `${message}:${authorId}:${repoId}:${Date.now()}:${Math.random()}`;
  return generateCommitHash(content);
};
