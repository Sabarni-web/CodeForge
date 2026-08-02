import path from 'path';
import { commentSyntaxMap } from '../utils/languageCommentMap.js';

/**
 * Gets the comment syntax configuration for a given filename
 * @param {string} filename 
 * @returns {object|null} The comment syntax object or null if unsupported
 */
export const getCommentSyntax = (filename) => {
  if (!filename) return null;
  
  const lowerName = filename.toLowerCase();
  
  // Special case for Dockerfile
  if (lowerName === 'dockerfile') {
    return commentSyntaxMap['dockerfile'];
  }

  const ext = path.extname(lowerName);
  const syntax = commentSyntaxMap[ext];

  if (!syntax || syntax.unsupported) {
    return null;
  }

  return syntax;
};

/**
 * Checks if a file is supported by Guardian
 * @param {string} filename 
 * @returns {boolean}
 */
export const isSupportedFile = (filename) => {
  return getCommentSyntax(filename) !== null;
};
