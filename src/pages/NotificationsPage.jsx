import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
} from '../features/notifications/notificationSlice';
import { acceptFollowRequest, rejectFollowRequest } from '../features/follow/followSlice';
import { acceptInvitation, rejectInvitation } from '../features/repos/repositoryCollaboratorSlice';
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiUserCheck,
  FiUserMinus,
  FiBookOpen,
  FiMessageSquare,
  FiShield,
  FiMail,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    try {
      await dispatch(markNotificationRead(id)).unwrap();
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error(err || 'Failed to update notification');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete notification');
    }
  };

  const handleAcceptFollow = async (requestId, notificationId) => {
    try {
      await dispatch(acceptFollowRequest(requestId)).unwrap();
      toast.success('Follow request accepted');
      // Mark notification read automatically
      await dispatch(markNotificationRead(notificationId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to accept follow request');
    }
  };

  const handleRejectFollow = async (requestId, notificationId) => {
    try {
      await dispatch(rejectFollowRequest(requestId)).unwrap();
      toast.success('Follow request rejected');
      // Mark notification read automatically
      await dispatch(markNotificationRead(notificationId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to reject follow request');
    }
  };

  const handleAcceptInvitation = async (invitationId, notificationId) => {
    try {
      await dispatch(acceptInvitation(invitationId)).unwrap();
      toast.success('Invitation accepted successfully');
      await dispatch(markNotificationRead(notificationId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to accept invitation');
    }
  };

  const handleRejectInvitation = async (invitationId, notificationId) => {
    try {
      await dispatch(rejectInvitation(invitationId)).unwrap();
      toast.success('Invitation declined');
      await dispatch(markNotificationRead(notificationId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to decline invitation');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'FOLLOW_REQUEST':
        return <FiShield className="w-5 h-5 text-yellow-500" />;
      case 'FOLLOW_ACCEPTED':
        return <FiUserCheck className="w-5 h-5 text-green-500" />;
      case 'FOLLOW_REJECTED':
        return <FiUserMinus className="w-5 h-5 text-red-500" />;
      case 'REPOSITORY_STAR':
        return <FiBookOpen className="w-5 h-5 text-blue-500" />;
      case 'COMMENT':
        return <FiMessageSquare className="w-5 h-5 text-purple-500" />;
      case 'REPOSITORY_INVITATION':
        return <FiMail className="w-5 h-5 text-yellow-500" />;
      case 'INVITATION_ACCEPTED':
        return <FiUserCheck className="w-5 h-5 text-green-500" />;
      case 'INVITATION_REJECTED':
      case 'REMOVED_FROM_REPOSITORY':
        return <FiUserMinus className="w-5 h-5 text-red-500" />;
      case 'TRANSFERRED_OWNERSHIP':
        return <FiUserCheck className="w-5 h-5 text-green-500" />;
      default:
        return <FiBell className="w-5 h-5 text-dark-400" />;
    }
  };

  // Helper to extract requestId from notification link
  const getRequestId = (link) => {
    if (!link) return null;
    const match = link.match(/[?&]requestId=([^&]+)/);
    return match ? match[1] : null;
  };

  // Helper to extract invitationId from notification link
  const getInvitationId = (link) => {
    if (!link) return null;
    const match = link.match(/[?&]invitationId=([^&]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <FiBell className="w-8 h-8 text-brand-500" />
            Notifications
          </h1>
          <p className="text-dark-400">Stay updated on your social requests and activities</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 h-24 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-dark-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-700 rounded w-1/2" />
                <div className="h-3 bg-dark-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiBell className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">All caught up!</h3>
          <p className="text-dark-400 text-sm">You have no new notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => {
            const requestId = getRequestId(n.link);
            const invitationId = getInvitationId(n.link);
            return (
              <div
                key={n._id}
                className={`glass-card p-5 border-l-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  n.isRead ? 'border-l-transparent bg-dark-900/40' : 'border-l-brand-500 bg-dark-900'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      {n.sender && (
                        <Link
                          to={`/profile/${n.sender.username}`}
                          className="font-bold text-dark-100 hover:text-brand-400 transition-colors text-sm"
                        >
                          {n.sender.displayName || n.sender.username}
                        </Link>
                      )}
                      <span className="text-xs text-dark-500">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-dark-200 text-sm mt-1">{n.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {n.type === 'FOLLOW_REQUEST' && !n.isRead && requestId && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <button
                        onClick={() => handleAcceptFollow(requestId, n._id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectFollow(requestId, n._id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {n.type === 'REPOSITORY_INVITATION' && !n.isRead && invitationId && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitationId, n._id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(invitationId, n._id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-2 text-dark-400 hover:text-green-400 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-2 text-dark-400 hover:text-red-400 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                    title="Delete notification"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
