import express from 'express';
import auth from '../middleware/auth.js';
import { validateFork } from '../validators/forkValidator.js';
import { canForkRepository } from '../middleware/canForkRepository.js';
import {
  forkRepository,
  getUserForks,
  getRepositoryForks,
  getNetwork,
  getUpstream,
  checkIsFork
} from '../controllers/forkController.js';

const router = express.Router();

// GET all forks created by the authenticated user
router.get('/user', auth, getUserForks);

// POST fork a repository
router.post('/:id/fork', auth, validateFork, canForkRepository, forkRepository);

// GET forks of a specific repository
router.get('/:id/forks', getRepositoryForks);

// GET the network graph of a repository
router.get('/:id/network', getNetwork);

// GET the upstream repository
router.get('/:id/upstream', getUpstream);

// GET whether a repo is a fork
router.get('/:id/is-fork', checkIsFork);

export default router;
