import { Router } from 'express';
import { searchUsers } from '../controllers/searchController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/search', searchUsers);

export default router;
