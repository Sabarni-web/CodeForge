import { Router } from 'express';
import {
  getNotifications,
  markRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { notificationIdValidator } from '../validators/notificationValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.route('/')
  .get(getNotifications);

router.route('/:id')
  .patch(validate(notificationIdValidator), markRead)
  .delete(validate(notificationIdValidator), deleteNotification);

export default router;
