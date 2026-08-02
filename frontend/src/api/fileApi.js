import api from './axiosConfig.js';

export const getFileTreeAPI = (repoId, branch = 'main') => api.get(`/repos/${repoId}/files?branch=${branch}`);
export const getFileContentAPI = (repoId, fileId, branch = 'main') => api.get(`/repos/${repoId}/files/${fileId}?branch=${branch}`);
export const createFileAPI = (repoId, data) => api.post(`/repos/${repoId}/files`, data);
export const updateFileAPI = (repoId, fileId, data) => api.put(`/repos/${repoId}/files/${fileId}`, data);
export const deleteFileAPI = (repoId, fileId, branch = 'main') => api.delete(`/repos/${repoId}/files/${fileId}?branch=${branch}`);
export const getCommitsAPI = (repoId, page = 1, branch = 'main') => api.get(`/repos/${repoId}/commits?page=${page}&branch=${branch}`);
export const uploadBulkFilesAPI = (repoId, files, branch = 'main') => api.post(`/repos/${repoId}/files/bulk`, { files, branch });
