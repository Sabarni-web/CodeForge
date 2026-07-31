import { Router } from 'express';
import {
  getProfile,
  getFollowers,
  getFollowing,
  updateProfileSocial,
} from '../controllers/profileController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.route('/')
  .put(updateProfileSocial);

router.route('/:username')
  .get(getProfile);

router.route('/:username/followers')
  .get(getFollowers);

router.route('/:username/following')
  .get(getFollowing);

export default router;
