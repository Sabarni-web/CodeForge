import { Router } from 'express';
import * as searchController from '../controllers/repositorySearchController.js';

const router = Router();

// Public search endpoint
router.get('/search', searchController.searchPublicRepositories);

export default router;
