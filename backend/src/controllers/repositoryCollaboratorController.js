import * as collaboratorService from '../services/repositoryCollaboratorService.js';

export const inviteUser = async (req, res, next) => {
  try {
    const { username, role } = req.body;
    const result = await collaboratorService.inviteUser(req.params.id, username, role, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await collaboratorService.acceptInvitation(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Invitation accepted successfully', invitation });
  } catch (error) {
    next(error);
  }
};

export const rejectInvitation = async (req, res, next) => {
  try {
    const result = await collaboratorService.rejectInvitation(req.params.id, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const removeCollaborator = async (req, res, next) => {
  try {
    const result = await collaboratorService.removeCollaborator(req.params.id, req.params.userId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const transferOwnership = async (req, res, next) => {
  try {
    const { username } = req.body;
    const result = await collaboratorService.transferOwnership(req.params.id, username, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req, res, next) => {
  try {
    const result = await collaboratorService.getMembers(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
