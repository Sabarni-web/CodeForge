import express from 'express';
import auth from '../middleware/auth.js';
import { getRepositoryDNA, getFileDNA } from '../controllers/dnaController.js';

const router = express.Router();

router.get('/repository/:id/dna', auth, getRepositoryDNA);
router.get('/file/:id/dna', auth, getFileDNA);

export default router;
