import Branch from '../models/Branch.js';
import File from '../models/File.js';
import Commit from '../models/Commit.js';
import Repository from '../models/Repository.js';
import { createCommit } from '../services/commitService.js';

/**
 * @desc    Get all branches for a repository
 * @route   GET /api/repos/:repoId/branches
 * @access  Private
 */
export const getBranches = async (req, res, next) => {
  try {
    const { repoId } = req.params;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    const branches = await Branch.find({ repository: repoId }).sort({ createdAt: -1 });

    // Always ensure at least "main" is returned even if not created yet
    let hasMain = branches.some(b => b.name === 'main');
    if (!hasMain) {
      branches.unshift({ _id: 'temp-main', name: 'main', repository: repoId, createdAt: repo.createdAt });
    }

    res.status(200).json({
      success: true,
      branches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new branch from a source branch
 * @route   POST /api/repos/:repoId/branches
 * @access  Private
 */
export const createBranch = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { name, sourceBranch = 'main' } = req.body;

    if (!name) {
      const error = new Error('Branch name is required');
      error.statusCode = 400;
      throw error;
    }

    const repo = await Repository.findById(repoId);
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    const existingBranch = await Branch.findOne({ repository: repoId, name });
    if (existingBranch || name === 'main') {
      const error = new Error('Branch already exists');
      error.statusCode = 400;
      throw error;
    }

    // Copy all files from source branch to new branch
    const sourceFiles = await File.find({ repository: repoId, branch: sourceBranch }).lean();
    
    const newFiles = sourceFiles.map(f => {
      const { _id, createdAt, updatedAt, __v, lastCommit, ...fileData } = f;
      return {
        ...fileData,
        branch: name,
      };
    });

    const branch = await Branch.create({
      name,
      repository: repoId,
      creator: req.user._id,
    });

    let commitId = null;
    if (newFiles.length > 0) {
      const insertedFiles = await File.insertMany(newFiles);
      
      const commit = await createCommit({
        message: `Create branch ${name} from ${sourceBranch}`,
        authorId: req.user._id,
        repoId,
        files: insertedFiles.map(f => ({ file: f._id, action: 'added', filePath: f.path })),
        branch: name,
      });

      // Update lastCommit on all inserted files
      await File.updateMany(
        { repository: repoId, branch: name },
        { $set: { lastCommit: commit._id } }
      );
      
      commitId = commit._id;
      branch.headCommit = commitId;
      await branch.save();
    } else {
      const commit = await createCommit({
        message: `Create branch ${name} from ${sourceBranch}`,
        authorId: req.user._id,
        repoId,
        files: [],
        branch: name,
      });
      commitId = commit._id;
      branch.headCommit = commitId;
      await branch.save();
    }

    res.status(201).json({
      success: true,
      branch,
      message: `Branch ${name} created successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rename a branch
 * @route   PUT /api/repos/:repoId/branches/:branchName
 * @access  Private (Contributor)
 */
export const renameBranch = async (req, res, next) => {
  try {
    const { repoId, branchName } = req.params;
    const { newName } = req.body;

    if (!newName) {
      const error = new Error('New branch name is required');
      error.statusCode = 400;
      throw error;
    }

    if (branchName === 'main' || newName === 'main') {
      const error = new Error('Cannot rename main branch or rename to main');
      error.statusCode = 400;
      throw error;
    }

    const branch = await Branch.findOne({ repository: repoId, name: branchName });
    if (!branch) {
      const error = new Error('Branch not found');
      error.statusCode = 404;
      throw error;
    }

    const existingBranch = await Branch.findOne({ repository: repoId, name: newName });
    if (existingBranch) {
      const error = new Error('A branch with the new name already exists');
      error.statusCode = 400;
      throw error;
    }

    // Update branch model
    branch.name = newName;
    await branch.save();

    // Update all files and commits associated with this branch
    await File.updateMany(
      { repository: repoId, branch: branchName },
      { $set: { branch: newName } }
    );

    await Commit.updateMany(
      { repository: repoId, branch: branchName },
      { $set: { branch: newName } }
    );

    res.status(200).json({
      success: true,
      branch,
      message: `Branch renamed to ${newName}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a branch
 * @route   DELETE /api/repos/:repoId/branches/:branchName
 * @access  Private (Contributor)
 */
export const deleteBranch = async (req, res, next) => {
  try {
    const { repoId, branchName } = req.params;

    if (branchName === 'main') {
      const error = new Error('Cannot delete main branch');
      error.statusCode = 400;
      throw error;
    }

    const branch = await Branch.findOneAndDelete({ repository: repoId, name: branchName });
    if (!branch) {
      const error = new Error('Branch not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete isolated files and commits
    await File.deleteMany({ repository: repoId, branch: branchName });
    await Commit.deleteMany({ repository: repoId, branch: branchName });

    res.status(200).json({
      success: true,
      message: `Branch ${branchName} deleted`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Merge a branch into main
 * @route   POST /api/repos/:repoId/branches/:branchName/merge
 * @access  Private (Contributor)
 */
export const mergeBranch = async (req, res, next) => {
  try {
    const { repoId, branchName } = req.params;

    if (branchName === 'main') {
      const error = new Error('Cannot merge main into main');
      error.statusCode = 400;
      throw error;
    }

    const sourceFiles = await File.find({ repository: repoId, branch: branchName }).lean();
    
    // Process merge: For each file in source, update or insert into main
    const targetFiles = await File.find({ repository: repoId, branch: 'main' }).lean();
    const targetMap = new Map(targetFiles.map(f => [f.path, f]));

    const modifiedFiles = [];
    const createdFiles = [];
    const commitFilesData = [];

    for (const sFile of sourceFiles) {
      const existing = targetMap.get(sFile.path);
      if (existing) {
        // Update existing file in main
        const doc = await File.findById(existing._id);
        doc.content = sFile.content;
        doc.size = sFile.size;
        modifiedFiles.push(doc);
        commitFilesData.push({ file: doc._id, action: 'modified', filePath: doc.path });
      } else {
        // Create new file in main
        const { _id, createdAt, updatedAt, __v, lastCommit, ...fileData } = sFile;
        const newFile = new File({
          ...fileData,
          branch: 'main',
        });
        createdFiles.push(newFile);
        commitFilesData.push({ file: newFile._id, action: 'added', filePath: newFile.path });
      }
    }

    if (commitFilesData.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nothing to merge',
      });
    }

    // Create merge commit
    const commit = await createCommit({
      message: `Merge branch '${branchName}' into 'main'`,
      authorId: req.user._id,
      repoId,
      files: commitFilesData,
      branch: 'main',
    });

    for (const f of modifiedFiles) {
      f.lastCommit = commit._id;
      await f.save();
    }

    if (createdFiles.length > 0) {
      for (const f of createdFiles) {
        f.lastCommit = commit._id;
      }
      await File.insertMany(createdFiles);
    }

    res.status(200).json({
      success: true,
      message: `Branch ${branchName} successfully merged into main`,
    });
  } catch (error) {
    next(error);
  }
};
