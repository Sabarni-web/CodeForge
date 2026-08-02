import { getCommitHistory, getCommitById } from '../services/commitService.js';
import Repository from '../models/Repository.js';

/**
 * @desc    Get commit history for a repository
 * @route   GET /api/repos/:repoId/commits
 * @access  Private
 */
export const getRepoCommits = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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

    const result = await getCommitHistory(repoId, page, limit, branch);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single commit
 * @route   GET /api/commits/:commitId
 * @access  Private
 */
export const getSingleCommit = async (req, res, next) => {
  try {
    const commit = await getCommitById(req.params.commitId);

    if (!commit) {
      const error = new Error('Commit not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      commit,
    });
  } catch (error) {
    next(error);
  }
};
