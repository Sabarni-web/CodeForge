import User from '../models/User.js';
import Repository from '../models/Repository.js';
import FollowRequest from '../models/FollowRequest.js';

export const searchUsers = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    
    // Partial, case-insensitive, and lenient regex query (allows spaces/underscores to match)
    const query = {};
    if (q) {
      const lenientQ = q.trim().replace(/[\s_]+/g, '.*');
      query.$or = [
        { username: { $regex: lenientQ, $options: 'i' } },
        { displayName: { $regex: lenientQ, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('username displayName avatar bio followers following')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(query);

    // Get repository count and follow status for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const repoCount = await Repository.countDocuments({ owner: u._id });
        
        let followStatus = { isFollowing: false, isPending: false, requestId: null };
        if (req.user) {
          const isFollowing = req.user.following?.some(id => id.toString() === u._id.toString()) || false;
          
          // Check for pending/rejected requests
          const request = await FollowRequest.findOne({
            sender: req.user._id,
            receiver: u._id,
          }).lean();
          
          followStatus = {
            isFollowing,
            isPending: request?.status === 'pending',
            requestId: request?._id || null,
          };
        }

        return {
          _id: u._id,
          username: u.username,
          displayName: u.displayName || '',
          avatar: u.avatar || '',
          bio: u.bio || '',
          followerCount: u.followers?.length || 0,
          followingCount: u.following?.length || 0,
          repositoryCount: repoCount,
          ...followStatus,
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithCounts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};
