import { Router } from 'express';
import { generateSite, getMySites, getSiteById, deleteSite } from '../controllers/aiController.js';
import { generateSiteValidator } from '../validators/aiValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.post('/generate', validate(generateSiteValidator), generateSite);
router.get('/sites', getMySites);
router.route('/sites/:id')
  .get(getSiteById)
  .delete(deleteSite);

export default router;
