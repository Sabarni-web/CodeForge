import Repository from '../models/Repository.js';
import User from '../models/User.js';

/**
 * Search public repositories with filters, pagination, and sorting
 * @param {object} queryParams
 * @returns {Promise<object>}
 */
export const searchPublicRepositories = async (queryParams) => {
  const { q = '', owner = '', language = '', topics = '', sort = 'newest', page = 1, limit = 10 } = queryParams;

  const query = { visibility: 'public' };

  if (q) {
    query.name = { $regex: q, $options: 'i' };
  }

  if (owner) {
    const owners = await User.find({ username: { $regex: owner, $options: 'i' } }).select('_id').lean();
    const ownerIds = owners.map(o => o._id);
    query.owner = { $in: ownerIds };
  }

  if (language) {
    query.language = { $regex: `^${language}$`, $options: 'i' };
  }

  if (topics) {
    const topicList = Array.isArray(topics) 
      ? topics 
      : topics.split(',').map(t => t.trim()).filter(Boolean);
    if (topicList.length > 0) {
      query.topics = { $in: topicList };
    }
  }

  let sortCriteria = { createdAt: -1 };
  if (sort === 'oldest') {
    sortCriteria = { createdAt: 1 };
  } else if (sort === 'stars') {
    sortCriteria = { starCount: -1, createdAt: -1 };
  } else if (sort === 'forks') {
    sortCriteria = { forkCount: -1, createdAt: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const repositories = await Repository.find(query)
    .populate('owner', 'username avatar displayName')
    .sort(sortCriteria)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Repository.countDocuments(query);

  return {
    repositories,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
};
