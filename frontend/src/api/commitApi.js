import api from './axiosConfig.js';

export const getUserProfileAPI = (username) => api.get(`/users/${username}`);
export const updateProfileAPI = (data) => api.put('/users/profile', data);
