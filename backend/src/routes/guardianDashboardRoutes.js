import express from 'express';
import auth from '../middleware/auth.js';
import { fetchUserDashboard } from '../controllers/guardianDashboardController.js';
import { verifyPublicCertificate } from '../controllers/certificateVerificationController.js';

const router = express.Router();

// Private dashboard routes
router.get('/dashboard', auth, fetchUserDashboard);

// Public verification
router.get('/certificate/:certificateId', verifyPublicCertificate);

export default router;
