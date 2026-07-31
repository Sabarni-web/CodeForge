import User from '../models/User.js';
import Repository from '../models/Repository.js';
import Commit from '../models/Commit.js';

export const getProfileByUsername = async (username, viewerId = null) => {
  const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } })
    .populate('pinnedRepositories')
    .lean();

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Determine if viewer is the owner of the profile
  const isOwner = viewerId && viewerId.toString() === user._id.toString();

  // Fetch repositories
  const repoQuery = { owner: user._id };
  if (!isOwner) {
    repoQuery.isPrivate = false;
  }
  const repositories = await Repository.find(repoQuery).sort({ updatedAt: -1 }).lean();

  // If no pinned repositories, we can default to top repositories or empty
  const pinned = user.pinnedRepositories || [];

  // Recent repositories (e.g. limit 6)
  const recentRepositories = repositories.slice(0, 6);

  // Contributions Statistics (commits in the last year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const commits = await Commit.find({
    author: user._id,
    createdAt: { $gte: oneYearAgo },
  }).select('createdAt').lean();

  // Group commits by YYYY-MM-DD
  const contributionMap = {};
  commits.forEach((c) => {
    const dateStr = c.createdAt.toISOString().split('T')[0];
    contributionMap[dateStr] = (contributionMap[dateStr] || 0) + 1;
  });

  const contributionStats = {
    totalCommits: commits.length,
    calendar: contributionMap, // e.g. { "2026-07-28": 3 }
  };

  // Remove sensitive fields
  delete user.password;

  return {
    ...user,
    repositoriesCount: repositories.length,
    pinnedRepositories: pinned,
    recentRepositories,
    contributionStats,
  };
};

export const getFollowers = async (username, viewerId = null, queryParams = {}) => {
  const { search = '', sort = 'username', page = 1, limit = 10 } = queryParams;

  const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean();
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const followerIds = user.followers || [];
  if (followerIds.length === 0) {
    return { followers: [], total: 0, page: Number(page), totalPages: 0 };
  }

  const query = { _id: { $in: followerIds } };
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  let sortCriteria = { username: 1 };
  if (sort === 'newest') {
    sortCriteria = { createdAt: -1 };
  } else if (sort === 'oldest') {
    sortCriteria = { createdAt: 1 };
  }

  const followersList = await User.find(query)
    .select('username displayName avatar bio followers following')
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(query);

  const userFollowerIdsSet = new Set(followerIds.map(id => id.toString()));

  const mappedFollowers = await Promise.all(
    followersList.map(async (f) => {
      let isFollowingBack = false;
      if (viewerId) {
        const viewerUser = await User.findById(viewerId).lean();
        isFollowingBack = viewerUser?.following?.some((id) => id.toString() === f._id.toString()) || false;
      }

      // Calculate mutual followers
      const mutual = (f.followers || []).filter((id) =>
        userFollowerIdsSet.has(id.toString())
      ).length;

      return {
        _id: f._id,
        username: f.username,
        displayName: f.displayName || '',
        avatar: f.avatar || '',
        bio: f.bio || '',
        isFollowingBack,
        mutualCount: mutual,
      };
    })
  );

  return {
    followers: mappedFollowers,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getFollowing = async (username, queryParams = {}) => {
  const { search = '', sort = 'username', page = 1, limit = 10 } = queryParams;

  const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean();
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const followingIds = user.following || [];
  if (followingIds.length === 0) {
    return { following: [], total: 0, page, totalPages: 0 };
  }

  // Query to find users being followed
  const query = { _id: { $in: followingIds } };
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  let sortCriteria = { username: 1 };
  if (sort === 'newest') {
    sortCriteria = { createdAt: -1 };
  } else if (sort === 'oldest') {
    sortCriteria = { createdAt: 1 };
  }

  const followingList = await User.find(query)
    .select('username displayName avatar bio followers following')
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(query);

  return {
    following: followingList.map((f) => ({
      _id: f._id,
      username: f.username,
      displayName: f.displayName || '',
      avatar: f.avatar || '',
      bio: f.bio || '',
      followersCount: f.followers?.length || 0,
      followingCount: f.following?.length || 0,
    })),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};
