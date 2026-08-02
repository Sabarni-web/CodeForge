import express from 'express';
import auth from '../middleware/auth.js';
import {
  enableGuardian,
  disableGuardian,
  getGuardianStatus,
  getFileCertificate,
} from '../controllers/guardianController.js';

const router = express.Router();

// Route: /api/repository/:id/guardian
router.post('/repository/:id/guardian/enable', auth, enableGuardian);
router.post('/repository/:id/guardian/disable', auth, disableGuardian);
router.get('/repository/:id/guardian/status', auth, getGuardianStatus);

// Route: /api/file/:id/certificate
router.get('/file/:id/certificate', auth, getFileCertificate);

export default router;
