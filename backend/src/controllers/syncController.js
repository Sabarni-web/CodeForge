import Repository from '../models/Repository.js';
import File from '../models/File.js';
import Commit from '../models/Commit.js';
import FileVersion from '../models/FileVersion.js';
import { hasAccess } from '../services/repositoryPermissionService.js';
import { getIo } from '../services/socketService.js';
import crypto from 'crypto';
import Notification from '../models/Notification.js';
import { queueFileDNA, queueRepositoryDNA } from '../workers/dnaWorker.js';

// Helper to calculate hash on backend just in case
const generateHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * @desc    Compare local files with repository
 * @route   POST /api/repository/:id/sync/compare
 * @access  Private
 */
export const compareSync = async (req, res, next) => {
  try {
    const { localFiles } = req.body; // Array of { path, hash, size, lastModified }
    const repoId = req.params.id;

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    const canAccess = await hasAccess(repo._id, req.user._id);
    if (!canAccess) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    const currentFiles = await File.find({ repository: repoId }).lean();
    const currentFilesMap = new Map(currentFiles.map((f) => [f.path, f]));

    const added = [];
    const modified = [];
    const deleted = [];

    // Check for added and modified
    for (const localFile of localFiles) {
      const dbFile = currentFilesMap.get(localFile.path);
      if (!dbFile) {
        added.push(localFile);
      } else if (dbFile.hash !== localFile.hash) {
        modified.push(localFile);
      }
      currentFilesMap.delete(localFile.path);
    }

    // Remaining in map are deleted (ignoring directories for sync unless explicitly handled)
    for (const [path, file] of currentFilesMap.entries()) {
      if (!file.isDirectory && file.name.toLowerCase() !== 'readme.md') {
        deleted.push({ path: file.path, hash: file.hash, size: file.size });
      }
    }

    res.status(200).json({
      success: true,
      diff: { added, modified, deleted },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sync (commit) changes to the repository
 * @route   POST /api/repository/:id/sync
 * @access  Private
 */
export const syncRepository = async (req, res, next) => {
  try {
    const repoId = req.params.id;
    const { commitMessage, added, modified, deleted } = req.body;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    const canAccess = await hasAccess(repo._id, req.user._id);
    if (!canAccess) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Increment repository version
    repo.totalVersions += 1;
    repo.lastSyncedAt = Date.now();
    await repo.save();

    // Create a new commit
    const newCommit = new Commit({
      hash: crypto.randomBytes(20).toString('hex'),
      shortHash: '',
      message: commitMessage || `Sync update to version ${repo.totalVersions}`,
      author: req.user._id,
      repository: repoId,
      files: [],
      addedFiles: added ? added.map((f) => f.path) : [],
      modifiedFiles: modified ? modified.map((f) => f.path) : [],
      deletedFiles: deleted ? deleted.map((f) => f.path) : [],
      totalChangedFiles: (added?.length || 0) + (modified?.length || 0) + (deleted?.length || 0),
    });
    newCommit.shortHash = newCommit.hash.substring(0, 7);

    // Get parent commit
    const parentCommit = await Commit.findOne({ repository: repoId }).sort({ createdAt: -1 });
    if (parentCommit) {
      newCommit.parentCommit = parentCommit._id;
    }
    await newCommit.save();

    // Process deletions
    if (deleted && deleted.length > 0) {
      for (const del of deleted) {
        await File.deleteOne({ repository: repoId, path: del.path });
        newCommit.files.push({ filePath: del.path, action: 'deleted' });
      }
    }

    const io = getIo();

    // Process additions
    if (added && added.length > 0) {
      for (const add of added) {
        let buffer;
        if (add.encoding === 'base64') {
          buffer = Buffer.from(add.content, 'base64');
        } else {
          buffer = Buffer.from(add.content || '');
        }

        const newFile = new File({
          name: add.path.split('/').pop(),
          path: add.path,
          content: buffer,
          repository: repoId,
          lastCommit: newCommit._id,
          size: add.size || buffer.length,
          mimeType: add.mimeType || 'text/plain',
          isDirectory: false,
          hash: add.hash || generateHash(buffer),
          version: repo.totalVersions,
          lastModified: Date.now(),
        });
        await newFile.save();

        const fileVer = new FileVersion({
          file: newFile._id,
          repository: repoId,
          versionNumber: repo.totalVersions,
          hash: newFile.hash,
          content: buffer,
          commit: newCommit._id,
          createdBy: req.user._id,
        });
        await fileVer.save();

        newCommit.files.push({ file: newFile._id, filePath: add.path, action: 'added' });
        
        if (io) io.to(`repo_${repoId}`).emit('FileUpdated', { fileId: newFile._id, action: 'added', path: add.path });
      }
    }

    // Process modifications
    if (modified && modified.length > 0) {
      for (const mod of modified) {
        let buffer;
        if (mod.encoding === 'base64') {
          buffer = Buffer.from(mod.content, 'base64');
        } else {
          buffer = Buffer.from(mod.content || '');
        }

        const existingFile = await File.findOne({ repository: repoId, path: mod.path });
        if (existingFile) {
          existingFile.content = buffer;
          existingFile.lastCommit = newCommit._id;
          existingFile.size = mod.size || buffer.length;
          existingFile.hash = mod.hash || generateHash(buffer);
          existingFile.version += 1;
          existingFile.lastModified = Date.now();
          await existingFile.save();

          const fileVer = new FileVersion({
            file: existingFile._id,
            repository: repoId,
            versionNumber: existingFile.version,
            hash: existingFile.hash,
            content: buffer,
            commit: newCommit._id,
            createdBy: req.user._id,
          });
          await fileVer.save();

          newCommit.files.push({ file: existingFile._id, filePath: mod.path, action: 'modified' });

          if (io) io.to(`repo_${repoId}`).emit('FileUpdated', { fileId: existingFile._id, action: 'modified', path: mod.path });
        }
      }
    }

    await newCommit.save();

    // Trigger CodeDNA generation for all modified/added files
    const changedFiles = [...(added || []), ...(modified || [])];
    if (changedFiles.length > 0) {
      changedFiles.forEach(cf => {
        // Find the file id by path to queue
        File.findOne({ repository: repoId, path: cf.path }).then(f => {
          if (f) queueFileDNA(f._id, false);
        });
      });
      // Trigger repo DNA summary
      queueRepositoryDNA(repoId);
    }

    // Create Notification
    const ownerId = repo.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      await Notification.create({
        recipient: ownerId,
        sender: req.user._id,
        type: 'REPOSITORY_SYNCED',
        repository: repo._id,
        message: `${req.user.username} synced changes to ${repo.name}`,
      });
    }

    if (io) {
      io.to(`repo_${repoId}`).emit('RepositoryUpdated', { repoId, version: repo.totalVersions });
      io.to(`repo_${repoId}`).emit('CommitCreated', { commit: newCommit });
    }

    res.status(200).json({ success: true, commit: newCommit, version: repo.totalVersions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get repository history
 * @route   GET /api/repository/:id/history
 * @access  Private
 */
export const getRepositoryHistory = async (req, res, next) => {
  try {
    const commits = await Commit.find({ repository: req.params.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, commits });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get file version history
 * @route   GET /api/file/:id/history
 * @access  Private
 */
export const getFileHistory = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const versions = await FileVersion.find({ file: fileId })
      .populate('commit', 'message shortHash createdAt')
      .populate('createdBy', 'username avatar')
      .sort({ versionNumber: -1 })
      .select('-content') // exclude buffer
      .lean();
    res.status(200).json({ success: true, versions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all file versions
 * @route   GET /api/file/:id/versions
 * @access  Private
 */
export const getFileVersions = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const versions = await FileVersion.find({ file: fileId })
      .select('versionNumber hash createdAt')
      .sort({ versionNumber: -1 })
      .lean();
    res.status(200).json({ success: true, versions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific file version content
 * @route   GET /api/file/:id/versions/:version
 * @access  Private
 */
export const getFileVersionContent = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const versionNumber = req.params.version;
    const version = await FileVersion.findOne({ file: fileId, versionNumber }).lean();
    if (!version) {
      const error = new Error('Version not found');
      error.statusCode = 404;
      throw error;
    }
    const contentStr = version.content ? version.content.toString('utf-8') : '';
    res.status(200).json({ success: true, content: contentStr });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get repository diff (compare two commits, or just the latest changes)
 * @route   GET /api/repository/:id/diff
 * @access  Private
 */
export const getRepositoryDiff = async (req, res, next) => {
  try {
    const { commitId } = req.query;
    if (commitId) {
      const commit = await Commit.findById(commitId)
        .populate('author', 'username avatar')
        .populate('files.file', 'name path')
        .lean();
      if (!commit) {
        return res.status(404).json({ success: false, message: 'Commit not found' });
      }
      return res.status(200).json({ success: true, diff: commit });
    }
    res.status(200).json({ success: true, message: 'Specify ?commitId=' });
  } catch (error) {
    next(error);
  }
};
