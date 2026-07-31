import { Router } from 'express';
import { getRepoCommits, getSingleCommit } from '../controllers/commitController.js';
import auth from '../middleware/auth.js';

import { hasRepositoryAccess } from '../middleware/repositoryAccess.js';

const router = Router({ mergeParams: true });

router.use(auth);
router.use(hasRepositoryAccess);

// GET /api/repos/:repoId/commits
router.get('/', getRepoCommits);

// GET /api/commits/:commitId
router.get('/:commitId', getSingleCommit);

export default router;
