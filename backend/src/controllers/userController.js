import User from '../models/User.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/:username
 * @access  Public
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${req.params.username}$`, 'i') } 
    }).lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (bio, avatar)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatar } = req.body;

    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).lean();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
