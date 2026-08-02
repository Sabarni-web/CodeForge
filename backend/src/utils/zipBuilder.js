import archiver from 'archiver';
import File from '../models/File.js';
import Repository from '../models/Repository.js';
import OwnershipCertificate from '../models/OwnershipCertificate.js';

/**
 * Stream a .zip archive of all files in a repository
 * @param {string} repoId - Repository ID
 * @param {string} repoName - Repository name (for the zip filename)
 * @param {object} res - Express response object
 */
export const streamRepoZip = async (repoId, repoName, res) => {
  const files = await File.find({ repository: repoId }).lean();
  const repository = await Repository.findById(repoId);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${repoName}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(res);

  for (const file of files) {
    if (file.content) {
      archive.append(Buffer.from(file.content), { name: file.path });
    }
  }

  // Add README if content exists
  if (repository.readme) {
    archive.append(repository.readme, { name: 'README.md' });
  }

  // Check if Guardian is enabled, inject Ownership Certificate
  if (repository.guardianEnabled) {
    const certificate = await OwnershipCertificate.findOne({
      targetId: repository._id,
      type: 'REPOSITORY'
    }).lean();

    if (certificate) {
      const certData = {
        certificateId: certificate.certificateId,
        type: certificate.type,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        digitalSignature: certificate.digitalSignature,
        repositoryInfo: {
          name: repository.name,
          id: repository._id
        }
      };
      archive.append(JSON.stringify(certData, null, 2), { name: '.guardian_certificate.json' });
    }
  }

  // Finalize the archive
  await archive.finalize();
};
