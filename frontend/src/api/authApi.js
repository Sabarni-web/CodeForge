import api from './axiosConfig.js';

export const loginAPI = (credentials) => api.post('/auth/login', credentials);
export const registerAPI = (userData) => api.post('/auth/register', userData);
export const logoutAPI = () => api.post('/auth/logout');
export const getMeAPI = () => api.get('/auth/me');
