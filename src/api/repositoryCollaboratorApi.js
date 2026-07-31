import api from './axiosConfig.js';

export const inviteUserAPI = (repoId, username, role) => 
  api.post(`/repository/${repoId}/invite`, { username, role });

export const acceptInvitationAPI = (invitationId) => 
  api.post(`/repository/invitation/${invitationId}/accept`);

export const rejectInvitationAPI = (invitationId) => 
  api.post(`/repository/invitation/${invitationId}/reject`);

export const removeCollaboratorAPI = (repoId, userId) => 
  api.delete(`/repository/${repoId}/collaborator/${userId}`);

export const transferOwnershipAPI = (repoId, username) => 
  api.patch(`/repository/${repoId}/transfer`, { username });

export const getMembersAPI = (repoId) => 
  api.get(`/repository/${repoId}/members`);
