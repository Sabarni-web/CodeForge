import archiver from 'archiver';
import File from '../models/File.js';

/**
 * Stream a .zip archive of all files in a repository
 * @param {string} repoId - Repository ID
 * @param {string} repoName - Repository name (for the zip filename)
 * @param {object} res - Express response object
 */
export const streamRepoZip = async (repoId, repoName, res) => {
  const files = await File.find({ repository: repoId }).lean();

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

  await archive.finalize();
};
