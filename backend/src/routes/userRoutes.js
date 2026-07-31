import { Router } from 'express';
import { getUserProfile, updateProfile } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.put('/profile', auth, updateProfile);
router.get('/:username', getUserProfile);

export default router;
