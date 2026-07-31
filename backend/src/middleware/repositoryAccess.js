import * as permissionService from '../services/repositoryPermissionService.js';
import Repository from '../models/Repository.js';

const getRepoId = (req) => {
  return req.params.id || req.params.repoId || req.body.repositoryId || req.query.repositoryId;
};

/**
 * Middleware: Verify user can read/access repository
 */
export const hasRepositoryAccess = async (req, res, next) => {
  try {
    const repoId = getRepoId(req);
    if (!repoId) {
      return res.status(400).json({ success: false, message: 'Repository ID is required' });
    }

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    const userId = req.user ? req.user._id : null;
    const canAccess = await permissionService.hasAccess(repoId, userId);

    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Forbidden — You do not have access to this repository' });
    }

    req.repository = repo;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify user is Repository Owner
 */
export const isRepositoryOwner = async (req, res, next) => {
  try {
    const repoId = getRepoId(req);
    if (!repoId) {
      return res.status(400).json({ success: false, message: 'Repository ID is required' });
    }

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    if (!req.user || repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden — Only the repository owner can perform this action' });
    }

    req.repository = repo;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify user is at least a Maintainer
 */
export const isMaintainer = async (req, res, next) => {
  try {
    const repoId = getRepoId(req);
    if (!repoId) {
      return res.status(400).json({ success: false, message: 'Repository ID is required' });
    }

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    const userId = req.user ? req.user._id : null;
    const allowed = await permissionService.hasRole(repoId, userId, ['Maintainer']);

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden — Requires Maintainer or Owner role' });
    }

    req.repository = repo;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify user is at least a Contributor
 */
export const isContributor = async (req, res, next) => {
  try {
    const repoId = getRepoId(req);
    if (!repoId) {
      return res.status(400).json({ success: false, message: 'Repository ID is required' });
    }

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    const userId = req.user ? req.user._id : null;
    const allowed = await permissionService.hasRole(repoId, userId, ['Contributor', 'Maintainer']);

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden — Requires Contributor, Maintainer or Owner role' });
    }

    req.repository = repo;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify user is at least a Viewer
 */
export const isViewer = async (req, res, next) => {
  try {
    const repoId = getRepoId(req);
    if (!repoId) {
      return res.status(400).json({ success: false, message: 'Repository ID is required' });
    }

    const repo = await Repository.findById(repoId).lean();
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    const userId = req.user ? req.user._id : null;
    const allowed = await permissionService.hasRole(repoId, userId, ['Viewer', 'Contributor', 'Maintainer']);

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden — Requires Viewer or higher role' });
    }

    req.repository = repo;
    next();
  } catch (error) {
    next(error);
  }
};
