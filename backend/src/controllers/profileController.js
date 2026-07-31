import * as profileService from '../services/profileService.js';
import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const viewerId = req.user ? req.user._id : null;
    const profile = await profileService.getProfileByUsername(username, viewerId);
    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const viewerId = req.user ? req.user._id : null;
    const result = await profileService.getFollowers(username, viewerId, req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await profileService.getFollowing(username, req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Extension for updating profile including new social fields
export const updateProfileSocial = async (req, res, next) => {
  try {
    const { displayName, bio, avatar, coverImage, location, website, pinnedRepositories } = req.body;
    
    const updateFields = {};
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (coverImage !== undefined) updateFields.coverImage = coverImage;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;
    if (pinnedRepositories !== undefined) updateFields.pinnedRepositories = pinnedRepositories;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('pinnedRepositories').lean();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
