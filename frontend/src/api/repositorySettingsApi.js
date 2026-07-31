import api from './axiosConfig.js';

export const updateSettingsAPI = (repoId, settingsData) => 
  api.patch(`/repository/${repoId}/settings`, settingsData);

export const updateVisibilityAPI = (repoId, visibility) => 
  api.patch(`/repository/${repoId}/visibility`, { visibility });

export const archiveRepoAPI = (repoId) => 
  api.patch(`/repository/${repoId}/archive`);

export const unarchiveRepoAPI = (repoId) => 
  api.patch(`/repository/${repoId}/unarchive`);

export const getStatisticsAPI = (repoId) => 
  api.get(`/repository/${repoId}/statistics`);
