import api from './axiosConfig.js';

export const generateSiteAPI = (data) => api.post('/ai/generate', data);
export const getMySitesAPI = () => api.get('/ai/sites');
export const getSiteByIdAPI = (id) => api.get(`/ai/sites/${id}`);
export const deleteSiteAPI = (id) => api.delete(`/ai/sites/${id}`);
