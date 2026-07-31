import Repository from '../models/Repository.js';
import Commit from '../models/Commit.js';
import File from '../models/File.js';
import RepositoryCollaborator from '../models/RepositoryCollaborator.js';

/**
 * Update general settings of a repository
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { name, description, website, topics, defaultBranch, license, allowIssues, allowDiscussions, allowPullRequests, readme } = req.body;
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    if (name !== undefined) repo.name = name;
    if (description !== undefined) repo.description = description;
    if (website !== undefined) repo.website = website;
    if (topics !== undefined) repo.topics = topics;
    if (defaultBranch !== undefined) repo.defaultBranch = defaultBranch;
    if (license !== undefined) repo.license = license;
    if (allowIssues !== undefined) repo.allowIssues = allowIssues;
    if (allowDiscussions !== undefined) repo.allowDiscussions = allowDiscussions;
    if (allowPullRequests !== undefined) repo.allowPullRequests = allowPullRequests;
    if (readme !== undefined) repo.readme = readme;

    await repo.save();

    res.status(200).json({
      success: true,
      message: 'Repository settings updated successfully',
      repository: repo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update repository visibility
 */
export const updateVisibility = async (req, res, next) => {
  try {
    const { visibility } = req.body;
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    repo.visibility = visibility;
    await repo.save();

    res.status(200).json({
      success: true,
      message: `Repository visibility updated to ${visibility} successfully`,
      repository: repo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive repository
 */
export const archiveRepository = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    repo.isArchived = true;
    await repo.save();

    res.status(200).json({
      success: true,
      message: 'Repository archived successfully',
      repository: repo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unarchive repository
 */
export const unarchiveRepository = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    repo.isArchived = false;
    await repo.save();

    res.status(200).json({
      success: true,
      message: 'Repository unarchived successfully',
      repository: repo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Repository Statistics
 */
export const getStatistics = async (req, res, next) => {
  try {
    const repoId = req.params.id;
    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    const commitCount = await Commit.countDocuments({ repository: repoId });
    const fileCount = await File.countDocuments({ repository: repoId });
    const collaboratorCount = await RepositoryCollaborator.countDocuments({ repository: repoId, status: 'Accepted' });

    res.status(200).json({
      success: true,
      statistics: {
        stars: repo.stars?.length || 0,
        forks: repo.forkCount || 0,
        watchers: repo.watchCount || 0,
        commits: commitCount,
        files: fileCount,
        collaborators: collaboratorCount
      }
    });
  } catch (error) {
    next(error);
  }
};
