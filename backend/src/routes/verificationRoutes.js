import express from 'express';
import auth from '../middleware/auth.js';
import { verifyCode, getVerificationReport } from '../controllers/verificationController.js';

const router = express.Router();

router.post('/verify', auth, verifyCode);
// Re-use verify for file/zip, frontend transforms to files array
router.post('/verify/file', auth, verifyCode);
router.post('/verify/zip', auth, verifyCode);

router.get('/report/:id', auth, getVerificationReport);

export default router;
