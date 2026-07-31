import Repository from '../models/Repository.js';
import File from '../models/File.js';
import Commit from '../models/Commit.js';
import { createCommit } from '../services/commitService.js';
import { getMimeType } from '../utils/constants.js';

/**
 * @desc    Create a new repository (with auto-generated README.md + initial commit)
 * @route   POST /api/repos
 * @access  Private
 */
export const createRepo = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;

    // Check for duplicate repo name for this user
    const existing = await Repository.findOne({
      name,
      owner: req.user._id,
    }).lean();

    if (existing) {
      const error = new Error('A repository with this name already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create the repository
    const repo = await Repository.create({
      name,
      description: description || '',
      owner: req.user._id,
      isPrivate: isPrivate || false,
    });

    // Auto-generate README.md
    const readmeContent = `# ${name}\n\n${description || 'A new CodeForge repository.'}\n`;

    const readmeFile = await File.create({
      name: 'README.md',
      path: 'README.md',
      content: Buffer.from(readmeContent, 'utf-8'),
      repository: repo._id,
      size: Buffer.byteLength(readmeContent, 'utf-8'),
      mimeType: 'text/markdown',
    });

    // Create initial commit
    const commit = await createCommit({
      message: 'Initial commit',
      authorId: req.user._id,
      repoId: repo._id,
      files: [
        {
          file: readmeFile._id,
          action: 'added',
          filePath: 'README.md',
        },
      ],
    });

    // Update the file with the commit reference
    readmeFile.lastCommit = commit._id;
    await readmeFile.save();

    res.status(201).json({
      success: true,
      repository: repo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all repositories for the logged-in user
 * @route   GET /api/repos
 * @access  Private
 */
export const getUserRepos = async (req, res, next) => {
  try {
    const repos = await Repository.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('owner', 'username avatar')
      .lean();

    res.status(200).json({
      success: true,
      count: repos.length,
      repositories: repos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all public repositories (explore)
 * @route   GET /api/repos/explore
 * @access  Public
 */
export const getPublicRepos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [repos, total] = await Promise.all([
      Repository.find({ isPrivate: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'username avatar')
        .lean(),
      Repository.countDocuments({ isPrivate: false }),
    ]);

    res.status(200).json({
      success: true,
      count: repos.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      repositories: repos,
    });
  } catch (error) {
    next(error);
  }
};

import { hasAccess } from '../services/repositoryPermissionService.js';

/**
 * @desc    Get a single repository by ID
 * @route   GET /api/repos/:id
 * @access  Private (owner) / Public (if not private)
 */
export const getRepoById = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id)
      .populate('owner', 'username avatar')
      .lean();

    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user has access (either public or collaborator/owner)
    const canAccess = await hasAccess(repo._id, req.user?._id);
    if (!canAccess) {
      const error = new Error('You do not have permission to view this repository');
      error.statusCode = 403;
      throw error;
    }

    // Get file count and commit count
    const [fileCount, commitCount] = await Promise.all([
      File.countDocuments({ repository: repo._id }),
      Commit.countDocuments({ repository: repo._id }),
    ]);

    res.status(200).json({
      success: true,
      repository: {
        ...repo,
        fileCount,
        commitCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a repository
 * @route   DELETE /api/repos/:id
 * @access  Private (owner only)
 */
export const deleteRepo = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    if (repo.owner.toString() !== req.user._id.toString()) {
      const error = new Error('You do not have permission to delete this repository');
      error.statusCode = 403;
      throw error;
    }

    // Delete all associated files and commits
    await Promise.all([
      File.deleteMany({ repository: repo._id }),
      Commit.deleteMany({ repository: repo._id }),
      Repository.findByIdAndDelete(repo._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Repository deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Star or unstar a repository
 * @route   PUT /api/repos/:id/star
 * @access  Private
 */
export const toggleStar = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = req.user._id.toString();
    const starIndex = repo.stars.findIndex((id) => id.toString() === userId);

    if (starIndex > -1) {
      // Unstar
      repo.stars.splice(starIndex, 1);
    } else {
      // Star
      repo.stars.push(req.user._id);
    }

    await repo.save();

    res.status(200).json({
      success: true,
      starred: starIndex === -1, // true if just starred, false if just unstarred
      starCount: repo.stars.length,
    });
  } catch (error) {
    next(error);
  }
};
