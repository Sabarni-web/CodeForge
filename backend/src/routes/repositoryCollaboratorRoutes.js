import { Router } from 'express';
import * as collaboratorController from '../controllers/repositoryCollaboratorController.js';
import auth from '../middleware/auth.js';
import { isRepositoryOwner, hasRepositoryAccess } from '../middleware/repositoryAccess.js';
import validate from '../middleware/validate.js';
import { inviteValidator, transferValidator } from '../validators/repositoryCollaboratorValidator.js';

const router = Router();

// Collaborator invitation/membership management
router.post(
  '/:id/invite',
  auth,
  isRepositoryOwner,
  validate(inviteValidator),
  collaboratorController.inviteUser
);

router.post(
  '/invitation/:id/accept',
  auth,
  collaboratorController.acceptInvitation
);

router.post(
  '/invitation/:id/reject',
  auth,
  collaboratorController.rejectInvitation
);

router.delete(
  '/:id/collaborator/:userId',
  auth,
  isRepositoryOwner,
  collaboratorController.removeCollaborator
);

router.patch(
  '/:id/transfer',
  auth,
  isRepositoryOwner,
  validate(transferValidator),
  collaboratorController.transferOwnership
);

router.get(
  '/:id/members',
  auth,
  hasRepositoryAccess,
  collaboratorController.getMembers
);

export default router;
