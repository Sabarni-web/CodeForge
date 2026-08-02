import crypto from 'crypto';

/**
 * Generate SHA-256 hash of a string or buffer
 */
export const generateSHA256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate SHA-512 hash of a string or buffer
 */
export const generateSHA512 = (data) => {
  return crypto.createHash('sha512').update(data).digest('hex');
};

/**
 * Generate a combined hash from multiple hashes (e.g. for repo structure)
 */
export const generateCombinedHash = (hashes, algorithm = 'sha256') => {
  const combined = hashes.sort().join('');
  return crypto.createHash(algorithm).update(combined).digest('hex');
};
