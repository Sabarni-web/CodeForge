import crypto from 'crypto';
import { getCommentSyntax } from './languageCommentService.js';
import { containsCertificate } from './certificateService.js';
import { buildCertificate } from '../utils/certificateBuilder.js';

/**
 * Processes a file buffer, generating and injecting a certificate if applicable.
 * 
 * @param {string} filename 
 * @param {Buffer} contentBuffer 
 * @param {object} repo - The repository object (needs name, _id, guardianEnabled)
 * @param {object} user - The user object (needs username, name/displayName)
 * @returns {object} { buffer: Buffer, certificateInserted: boolean, fileCertificateId: string|null }
 */
export const processFileBuffer = (filename, contentBuffer, repo, user) => {
  // If Guardian is disabled for this repo, return original buffer
  if (repo.guardianEnabled === false) {
    return { buffer: contentBuffer, certificateInserted: false, fileCertificateId: null };
  }

  const syntax = getCommentSyntax(filename);
  
  // If file type unsupported, return original buffer
  if (!syntax) {
    return { buffer: contentBuffer, certificateInserted: false, fileCertificateId: null };
  }

  // If already contains certificate, return original buffer
  if (containsCertificate(contentBuffer)) {
    return { buffer: contentBuffer, certificateInserted: false, fileCertificateId: null };
  }

  // Generate a unique File ID
  const fileId = `CF-FILE-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
  const repoId = repo.certificateId || `CF-REP-${repo._id.toString().substring(0, 8).toUpperCase()}`;

  // Prepare certificate data
  const certData = {
    ownerName: user.name || user.username,
    username: `@${user.username}`,
    repoName: repo.name,
    repoId: repoId,
    fileId: fileId,
    uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    verificationUrl: `https://codeforge.app/verify/${fileId}`
  };

  // Build the certificate string
  const certificateStr = buildCertificate(certData, syntax);
  
  // Prepend to original buffer
  const certBuffer = Buffer.from(certificateStr, 'utf-8');
  const combinedBuffer = Buffer.concat([certBuffer, contentBuffer]);

  return {
    buffer: combinedBuffer,
    certificateInserted: true,
    fileCertificateId: fileId
  };
};
