import api from './axiosConfig.js';

export const searchPublicReposAPI = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/repositories/search?${query}`);
};
