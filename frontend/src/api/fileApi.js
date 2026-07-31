import api from './axiosConfig.js';

export const getFileTreeAPI = (repoId) => api.get(`/repos/${repoId}/files`);
export const getFileContentAPI = (repoId, fileId) => api.get(`/repos/${repoId}/files/${fileId}`);
export const createFileAPI = (repoId, data) => api.post(`/repos/${repoId}/files`, data);
export const updateFileAPI = (repoId, fileId, data) => api.put(`/repos/${repoId}/files/${fileId}`, data);
export const deleteFileAPI = (repoId, fileId) => api.delete(`/repos/${repoId}/files/${fileId}`);
export const getCommitsAPI = (repoId, page = 1) => api.get(`/repos/${repoId}/commits?page=${page}`);
export const uploadBulkFilesAPI = (repoId, files) => api.post(`/repos/${repoId}/files/bulk`, { files });
