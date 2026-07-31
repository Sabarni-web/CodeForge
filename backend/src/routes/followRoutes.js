import { Router } from 'express';
import {
  sendRequest,
  cancelRequest,
  acceptRequest,
  rejectRequest,
  checkStatus,
} from '../controllers/followController.js';
import { sendFollowValidator, requestIdValidator, actionRequestValidator } from '../validators/followValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.post('/request', validate(sendFollowValidator), sendRequest);
router.delete('/request/:id', validate(requestIdValidator), cancelRequest);
router.post('/accept', validate(actionRequestValidator), acceptRequest);
router.post('/reject', validate(actionRequestValidator), rejectRequest);
router.get('/status/:receiverId', checkStatus);

export default router;
