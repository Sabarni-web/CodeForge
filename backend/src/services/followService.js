import FollowRequest from '../models/FollowRequest.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';

export const sendFollowRequest = async (senderId, receiverId) => {
  if (senderId.toString() === receiverId.toString()) {
    const err = new Error('You cannot follow yourself');
    err.statusCode = 400;
    throw err;
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    const err = new Error('Target user does not exist');
    err.statusCode = 404;
    throw err;
  }

  // Check if already following
  const sender = await User.findById(senderId);
  if (sender.following.includes(receiverId)) {
    const err = new Error('You are already following this user');
    err.statusCode = 400;
    throw err;
  }

  // Check for existing request
  const existingRequest = await FollowRequest.findOne({
    sender: senderId,
    receiver: receiverId,
  });

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      const err = new Error('Follow request is already pending');
      err.statusCode = 400;
      throw err;
    } else if (existingRequest.status === 'accepted') {
      const err = new Error('You are already following this user');
      err.statusCode = 400;
      throw err;
    } else {
      // Re-open rejected request
      existingRequest.status = 'pending';
      await existingRequest.save();

      // Create notification
      await createNotification({
        recipient: receiverId,
        sender: senderId,
        message: `${sender.username} requested to follow you`,
        type: 'FOLLOW_REQUEST',
        link: `/profile/${sender.username}?requestId=${existingRequest._id}`,
      });

      return existingRequest;
    }
  }

  const request = new FollowRequest({
    sender: senderId,
    receiver: receiverId,
    status: 'pending',
  });
  await request.save();

  // Create notification
  await createNotification({
    recipient: receiverId,
    sender: senderId,
    message: `${sender.username} requested to follow you`,
    type: 'FOLLOW_REQUEST',
    link: `/profile/${sender.username}?requestId=${request._id}`,
  });

  return request;
};

export const cancelFollowRequest = async (requestId, senderId) => {
  const request = await FollowRequest.findOneAndDelete({
    _id: requestId,
    sender: senderId,
    status: 'pending',
  });

  if (!request) {
    const err = new Error('Pending request not found or unauthorized');
    err.statusCode = 404;
    throw err;
  }

  return request;
};

export const acceptFollowRequest = async (requestId, receiverId) => {
  const request = await FollowRequest.findOne({
    _id: requestId,
    receiver: receiverId,
    status: 'pending',
  });

  if (!request) {
    const err = new Error('Pending follow request not found');
    err.statusCode = 404;
    throw err;
  }

  request.status = 'accepted';
  await request.save();

  // Update following/followers lists
  await User.findByIdAndUpdate(request.sender, { $addToSet: { following: request.receiver } });
  const receiver = await User.findByIdAndUpdate(request.receiver, { $addToSet: { followers: request.sender } });

  // Create notification for sender
  await createNotification({
    recipient: request.sender,
    sender: receiverId,
    message: `${receiver.username} accepted your follow request`,
    type: 'FOLLOW_ACCEPTED',
    link: `/profile/${receiver.username}`,
  });

  return request;
};

export const rejectFollowRequest = async (requestId, receiverId) => {
  const request = await FollowRequest.findOne({
    _id: requestId,
    receiver: receiverId,
    status: 'pending',
  });

  if (!request) {
    const err = new Error('Pending follow request not found');
    err.statusCode = 404;
    throw err;
  }

  request.status = 'rejected';
  await request.save();

  const receiver = await User.findById(receiverId);

  // Notify sender of rejection (optional but required per Socket.IO instructions: "Reject -> Sender immediately gets notification")
  await createNotification({
    recipient: request.sender,
    sender: receiverId,
    message: `${receiver.username} declined your follow request`,
    type: 'FOLLOW_REJECTED',
    link: `/profile/${receiver.username}`,
  });

  return request;
};

export const checkFollowStatus = async (senderId, receiverId) => {
  if (senderId.toString() === receiverId.toString()) {
    return { isFollowing: false, isPending: false };
  }
  const user = await User.findById(senderId).lean();
  const isFollowing = user?.following?.some(id => id.toString() === receiverId.toString()) || false;
  
  const request = await FollowRequest.findOne({ sender: senderId, receiver: receiverId }).lean();
  const isPending = request?.status === 'pending';
  const requestId = request?._id || null;

  return { isFollowing, isPending, requestId };
};
