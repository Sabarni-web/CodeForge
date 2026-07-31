import { Router } from 'express';
import * as settingsController from '../controllers/repositorySettingsController.js';
import auth from '../middleware/auth.js';
import { isRepositoryOwner, isMaintainer, hasRepositoryAccess } from '../middleware/repositoryAccess.js';
import validate from '../middleware/validate.js';
import { settingsUpdateValidator, visibilityUpdateValidator } from '../validators/repositorySettingsValidator.js';

const router = Router();

router.patch(
  '/:id/settings',
  auth,
  isMaintainer,
  validate(settingsUpdateValidator),
  settingsController.updateSettings
);

router.patch(
  '/:id/visibility',
  auth,
  isRepositoryOwner,
  validate(visibilityUpdateValidator),
  settingsController.updateVisibility
);

router.patch(
  '/:id/archive',
  auth,
  isRepositoryOwner,
  settingsController.archiveRepository
);

router.patch(
  '/:id/unarchive',
  auth,
  isRepositoryOwner,
  settingsController.unarchiveRepository
);

router.get(
  '/:id/statistics',
  auth,
  hasRepositoryAccess,
  settingsController.getStatistics
);

export default router;
