import * as followService from '../services/followService.js';

export const sendRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const request = await followService.sendFollowRequest(req.user._id, receiverId);
    res.status(201).json({
      success: true,
      message: 'Follow request sent successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    const request = await followService.cancelFollowRequest(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Follow request cancelled successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const request = await followService.acceptFollowRequest(requestId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Follow request accepted successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const request = await followService.rejectFollowRequest(requestId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Follow request rejected successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const checkStatus = async (req, res, next) => {
  try {
    const status = await followService.checkFollowStatus(req.user._id, req.params.receiverId);
    res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    next(error);
  }
};
