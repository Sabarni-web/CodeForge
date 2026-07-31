import { Router } from 'express';
import {
  createRepo,
  getUserRepos,
  getPublicRepos,
  getRepoById,
  deleteRepo,
  toggleStar,
} from '../controllers/repoController.js';
import { createRepoValidator, repoIdValidator } from '../validators/repoValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/explore', getPublicRepos);

// All routes below require authentication
router.use(auth);

router.route('/')
  .get(getUserRepos)
  .post(validate(createRepoValidator), createRepo);

router.route('/:id')
  .get(validate(repoIdValidator), getRepoById)
  .delete(validate(repoIdValidator), deleteRepo);

router.put('/:id/star', validate(repoIdValidator), toggleStar);

export default router;
