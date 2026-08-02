import express from 'express';
import { fetchGuardianAnalytics } from '../controllers/guardianAnalyticsController.js';

const router = express.Router();

// System-wide public analytics
router.get('/analytics', fetchGuardianAnalytics);
router.get('/statistics', fetchGuardianAnalytics); // alias requested

export default router;
