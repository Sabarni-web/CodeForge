import * as notificationService from '../services/notificationService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user._id);
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    if (!notification) {
      const error = new Error('Notification not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await notificationService.deleteNotification(req.params.id, req.user._id);
    if (!deleted) {
      const error = new Error('Notification not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
