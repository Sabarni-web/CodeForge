import Repository from '../models/Repository.js';

export const canForkRepository = async (req, res, next) => {
  try {
    const parentRepoId = req.params.id || req.params.repoId;
    const userId = req.user.id;

    if (!parentRepoId) {
      return res.status(400).json({ message: 'Repository ID is required' });
    }

    const repository = await Repository.findById(parentRepoId);

    if (!repository) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    if (repository.isPrivate) {
      return res.status(403).json({ message: 'Cannot fork a private repository' });
    }

    if (repository.isArchived) {
      return res.status(403).json({ message: 'Cannot fork an archived repository' });
    }

    // Allowed to fork own repository

    // Check if the user has already forked this repo
    // A user can only have one fork of a specific root/parent repo
    const existingFork = await Repository.findOne({
      owner: userId,
      $or: [
        { forkParent: parentRepoId },
        { forkRoot: repository.forkRoot || parentRepoId }
      ],
      isFork: true
    });

    if (existingFork) {
      return res.status(400).json({ message: 'You have already forked this repository' });
    }

    // Pass the parent repo to next middleware/controller
    req.parentRepository = repository;
    next();
  } catch (error) {
    console.error('Error in canForkRepository middleware:', error);
    res.status(500).json({ message: 'Server error validating fork permissions' });
  }
};
