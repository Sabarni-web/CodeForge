import Repository from '../models/Repository.js';
import ForkRelationship from '../models/ForkRelationship.js';
import User from '../models/User.js';

export const getRepositoryNetwork = async (rootRepoId) => {
  // Find all forks that share the same forkRoot, plus the root repo itself
  const networkRepos = await Repository.find({
    $or: [
      { _id: rootRepoId },
      { forkRoot: rootRepoId }
    ]
  })
  .populate('owner', 'username avatarUrl')
  .select('_id name owner isFork forkParent forkRoot forkDepth forkCount createdAt')
  .sort({ forkDepth: 1, createdAt: 1 });

  return networkRepos;
};

export const getUpstreamRepository = async (repoId) => {
  const repo = await Repository.findById(repoId).populate('forkParent', '_id name owner');
  if (!repo || !repo.isFork || !repo.forkParent) {
    return null;
  }
  
  const parentRepo = await Repository.findById(repo.forkParent._id).populate('owner', 'username avatarUrl');
  return parentRepo;
};

export const getTrendingForks = async (limit = 10) => {
  // Simple heuristic: forks created recently or repos with high forkCount
  const trending = await Repository.find({ isFork: true, isPrivate: false })
    .sort({ forkCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('owner', 'username avatarUrl');
  return trending;
};
