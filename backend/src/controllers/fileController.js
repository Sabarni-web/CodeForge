import File from '../models/File.js';
import Repository from '../models/Repository.js';
import { createCommit } from '../services/commitService.js';
import { buildFileTree } from '../services/fileTreeService.js';
import { getMimeType } from '../utils/constants.js';
import { processFileBuffer } from '../services/guardianService.js';
import { queueFileDNA } from '../workers/dnaWorker.js';

/**
 * @desc    Upload / create a new file in a repository
 * @route   POST /api/repos/:repoId/files
 * @access  Private (owner only)
 */
export const createFile = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { name, path: filePath, content, branch = 'main' } = req.body;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }



    // Check for duplicate path
    const existing = await File.findOne({ path: filePath, repository: repoId, branch }).lean();
    if (existing) {
      const error = new Error('A file with this path already exists in this branch');
      error.statusCode = 400;
      throw error;
    }

    const contentBuffer = Buffer.from(content || '', 'utf-8');
    
    if (contentBuffer.length > 10 * 1024 * 1024) {
      const error = new Error('File size exceeds the 10MB limit');
      error.statusCode = 400;
      throw error;
    }

    // Process Guardian Certificate
    const guardianResult = processFileBuffer(name, contentBuffer, repo, req.user);

    const file = await File.create({
      name,
      path: filePath,
      content: guardianResult.buffer,
      repository: repoId,
      branch,
      size: guardianResult.buffer.length,
      mimeType: getMimeType(name),
      guardianProtected: guardianResult.certificateInserted,
      fileCertificateId: guardianResult.fileCertificateId,
      certificateInsertedAt: guardianResult.certificateInserted ? new Date() : undefined,
    });

    // Create a commit for this file addition
    const commit = await createCommit({
      message: `Add ${filePath}`,
      authorId: req.user._id,
      repoId,
      files: [{ file: file._id, action: 'added', filePath }],
      branch,
    });

    file.lastCommit = commit._id;
    await file.save();

    // Trigger CodeDNA generation (asynchronous)
    queueFileDNA(file._id, true, repoId);

    res.status(201).json({
      success: true,
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        size: file.size,
        mimeType: file.mimeType,
      },
      commit: {
        _id: commit._id,
        shortHash: commit.shortHash,
        message: commit.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update file content
 * @route   PUT /api/repos/:repoId/files/:fileId
 * @access  Private (owner only)
 */
export const updateFile = async (req, res, next) => {
  try {
    const { repoId, fileId } = req.params;
    const { content, commitMessage, branch = 'main' } = req.body;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }



    const file = await File.findOne({ _id: fileId, repository: repoId, branch });
    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      throw error;
    }

    const contentBuffer = Buffer.from(content || '', 'utf-8');
    
    if (contentBuffer.length > 10 * 1024 * 1024) {
      const error = new Error('File size exceeds the 10MB limit');
      error.statusCode = 400;
      throw error;
    }

    // Process Guardian Certificate
    const guardianResult = processFileBuffer(file.name, contentBuffer, repo, req.user);

    file.content = guardianResult.buffer;
    file.size = guardianResult.buffer.length;
    
    // Only update these if a new certificate was inserted, do not overwrite if it already had one
    if (guardianResult.certificateInserted) {
      file.guardianProtected = true;
      file.fileCertificateId = guardianResult.fileCertificateId;
      file.certificateInsertedAt = new Date();
    }

    // Create a commit for this file update
    const commit = await createCommit({
      message: commitMessage || `Update ${file.path}`,
      authorId: req.user._id,
      repoId,
      files: [{ file: file._id, action: 'modified', filePath: file.path }],
      branch,
    });

    file.lastCommit = commit._id;
    await file.save();

    // Trigger CodeDNA generation
    queueFileDNA(file._id, true, repoId);

    res.status(200).json({
      success: true,
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        size: file.size,
      },
      commit: {
        _id: commit._id,
        shortHash: commit.shortHash,
        message: commit.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a file from a repository
 * @route   DELETE /api/repos/:repoId/files/:fileId
 * @access  Private (owner only)
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { repoId, fileId } = req.params;
    const branch = req.query.branch || 'main';

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }



    const file = await File.findOne({ _id: fileId, repository: repoId, branch });
    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      throw error;
    }

    // Create a commit for deletion
    await createCommit({
      message: `Delete ${file.path}`,
      authorId: req.user._id,
      repoId,
      files: [{ file: file._id, action: 'deleted', filePath: file.path }],
      branch,
    });

    await File.findByIdAndDelete(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single file's content
 * @route   GET /api/repos/:repoId/files/:fileId
 * @access  Private
 */
export const getFileContent = async (req, res, next) => {
  try {
    const { repoId, fileId } = req.params;
    const branch = req.query.branch || 'main';

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    // Check access
    if (repo.isPrivate && repo.owner.toString() !== req.user._id.toString()) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    const file = await File.findOne({ _id: fileId, repository: repoId, branch })
      .populate('lastCommit', 'shortHash message createdAt')
      .lean();

    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        content: file.content ? file.content.toString('utf-8') : '',
        size: file.size,
        mimeType: file.mimeType,
        lastCommit: file.lastCommit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get file tree for a repository
 * @route   GET /api/repos/:repoId/files
 * @access  Private
 */
export const getFileTree = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const branch = req.query.branch || 'main';

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    if (repo.isPrivate && repo.owner.toString() !== req.user._id.toString()) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    const files = await File.find({ repository: repoId, branch })
      .select('name path size mimeType isDirectory version lastModified lastCommit')
      .populate({
        path: 'lastCommit',
        select: 'message createdAt author',
        populate: {
          path: 'author',
          select: 'username',
        },
      })
      .lean();

    const tree = buildFileTree(files);

    res.status(200).json({
      success: true,
      tree,
      totalFiles: files.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload bulk files (e.g. folder upload)
 * @route   POST /api/repos/:repoId/files/bulk
 * @access  Private (owner only)
 */
export const uploadBulkFiles = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { files, branch = 'main' } = req.body; // Array of { path, content }

    if (!files || !Array.isArray(files) || files.length === 0) {
      const error = new Error('No files provided');
      error.statusCode = 400;
      throw error;
    }

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }



    const existing = await File.find({ 
      repository: repoId, 
      branch,
      path: { $in: files.map(f => f.path) } 
    });
    
    const existingMap = new Map();
    existing.forEach(e => existingMap.set(e.path, e));

    const createdFiles = [];
    const modifiedFiles = [];
    const commitFilesData = [];

    for (const fileData of files) {
      const { path: filePath, content } = fileData;
      const name = filePath.split('/').pop();
      const contentBuffer = Buffer.from(content || '', 'utf-8');

      if (contentBuffer.length > 10 * 1024 * 1024) {
        console.warn(`Skipping ${name}: file too large (max 10MB)`);
        continue;
      }

      // Process Guardian Certificate
      const guardianResult = processFileBuffer(name, contentBuffer, repo, req.user);

      if (existingMap.has(filePath)) {
        // Update existing file
        const existingFile = existingMap.get(filePath);
        existingFile.content = guardianResult.buffer;
        existingFile.size = guardianResult.buffer.length;
        if (guardianResult.certificateInserted) {
          existingFile.guardianProtected = true;
          existingFile.fileCertificateId = guardianResult.fileCertificateId;
          existingFile.certificateInsertedAt = new Date();
        }
        modifiedFiles.push(existingFile);
        commitFilesData.push({ file: existingFile._id, action: 'modified', filePath });
      } else {
        // Create new file
        const file = new File({
          name,
          path: filePath,
          content: guardianResult.buffer,
          repository: repoId,
          branch,
          size: guardianResult.buffer.length,
          mimeType: getMimeType(name),
          guardianProtected: guardianResult.certificateInserted,
          fileCertificateId: guardianResult.fileCertificateId,
          certificateInsertedAt: guardianResult.certificateInserted ? new Date() : undefined,
        });
        createdFiles.push(file);
        commitFilesData.push({ file: file._id, action: 'added', filePath });
      }
    }

    // Create a commit for all files
    const commit = await createCommit({
      message: `Upload folder with ${files.length} files`,
      authorId: req.user._id,
      repoId,
      files: commitFilesData,
      branch,
    });

    for (const file of createdFiles) {
      file.lastCommit = commit._id;
    }
    for (const file of modifiedFiles) {
      file.lastCommit = commit._id;
    }

    if (createdFiles.length > 0) {
      await File.insertMany(createdFiles);
    }
    
    for (const file of modifiedFiles) {
      await file.save();
    }

    // Trigger CodeDNA generation for all new files
    createdFiles.forEach(f => queueFileDNA(f._id, false));
    // Trigger repo DNA update once
    if (createdFiles.length > 0) {
      import('../workers/dnaWorker.js').then(({ queueRepositoryDNA }) => {
        queueRepositoryDNA(repoId);
      });
    }

    res.status(201).json({
      success: true,
      message: `Uploaded ${files.length} files successfully`,
      commit: {
        _id: commit._id,
        shortHash: commit.shortHash,
        message: commit.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

