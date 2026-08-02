import { Router } from 'express';
import {
  compareSync,
  syncRepository,
  getRepositoryHistory,
  getRepositoryDiff,
  getFileHistory,
  getFileVersions,
  getFileVersionContent
} from '../controllers/syncController.js';
import auth from '../middleware/auth.js';
import { hasRepositoryAccess } from '../middleware/repositoryAccess.js';

const router = Router();

router.use(auth);

// We'll mount this as `/api` in app.js or specific prefixes.
// Assuming we mount `app.use('/api', syncRoutes);`

// Repo level endpoints
router.post('/repository/:id/sync/compare', compareSync);
router.post('/repository/:id/sync', syncRepository);
router.get('/repository/:id/history', getRepositoryHistory);
router.get('/repository/:id/diff', getRepositoryDiff);

// File level endpoints
router.get('/file/:id/history', getFileHistory);
router.get('/file/:id/versions', getFileVersions);
router.get('/file/:id/versions/:version', getFileVersionContent);

export default router;
