import Notification from '../models/Notification.js';
import { sendToUser } from './socketService.js';

export const createNotification = async ({ recipient, sender, message, type, link }) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      message,
      type,
      link,
    });
    await notification.save();

    // Populate sender info for frontend rendering
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username avatar displayName')
      .lean();

    // Emit real-time notification via Socket.IO
    sendToUser(recipient, 'new_notification', populated);

    return populated;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getNotificationsForUser = async (userId) => {
  return await Notification.find({ recipient: userId })
    .populate('sender', 'username avatar displayName')
    .sort({ createdAt: -1 })
    .lean();
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  ).populate('sender', 'username avatar displayName').lean();
  
  if (notification) {
    sendToUser(userId, 'notification_updated', notification);
  }
  return notification;
};

export const deleteNotification = async (notificationId, userId) => {
  const deleted = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId }).lean();
  if (deleted) {
    sendToUser(userId, 'notification_deleted', { _id: notificationId });
  }
  return deleted;
};
