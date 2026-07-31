import api from './axiosConfig.js';

export const getUserReposAPI = () => api.get('/repos');
export const getPublicReposAPI = (page = 1) => api.get(`/repos/explore?page=${page}`);
export const getRepoByIdAPI = (id) => api.get(`/repos/${id}`);
export const createRepoAPI = (data) => api.post('/repos', data);
export const deleteRepoAPI = (id) => api.delete(`/repos/${id}`);
export const toggleStarAPI = (id) => api.put(`/repos/${id}/star`);
