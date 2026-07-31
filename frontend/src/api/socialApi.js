import api from './axiosConfig.js';

// Search
export const searchUsersAPI = (q, page = 1, limit = 10) => 
  api.get(`/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);

// Profile
export const getProfileAPI = (username) => api.get(`/profile/${username}`);
export const updateProfileSocialAPI = (profileData) => api.put('/profile', profileData);
export const getFollowersAPI = (username, { search = '', sort = 'username', page = 1, limit = 10 } = {}) => {
  const query = new URLSearchParams({ search, sort, page: String(page), limit: String(limit) }).toString();
  return api.get(`/profile/${username}/followers?${query}`);
};
export const getFollowingAPI = (username, { search = '', sort = 'username', page = 1, limit = 10 } = {}) => {
  const query = new URLSearchParams({ search, sort, page: String(page), limit: String(limit) }).toString();
  return api.get(`/profile/${username}/following?${query}`);
};

// Follow
export const sendFollowRequestAPI = (receiverId) => api.post('/follow/request', { receiverId });
export const cancelFollowRequestAPI = (requestId) => api.delete(`/follow/request/${requestId}`);
export const acceptFollowRequestAPI = (requestId) => api.post('/follow/accept', { requestId });
export const rejectFollowRequestAPI = (requestId) => api.post('/follow/reject', { requestId });
export const getFollowStatusAPI = (receiverId) => api.get(`/follow/status/${receiverId}`);

// Notifications
export const getNotificationsAPI = () => api.get('/notifications');
export const markNotificationReadAPI = (id) => api.patch(`/notifications/${id}`);
export const deleteNotificationAPI = (id) => api.delete(`/notifications/${id}`);
