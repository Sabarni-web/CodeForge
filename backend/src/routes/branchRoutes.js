import { Router } from 'express';
import { getBranches, createBranch, renameBranch, deleteBranch, mergeBranch } from '../controllers/branchController.js';
import auth from '../middleware/auth.js';
import { hasRepositoryAccess, isContributor } from '../middleware/repositoryAccess.js';

const router = Router({ mergeParams: true });

router.use(auth);

router.route('/')
  .get(hasRepositoryAccess, getBranches)
  .post(isContributor, createBranch);

router.route('/:branchName')
  .put(isContributor, renameBranch)
  .delete(isContributor, deleteBranch);

router.post('/:branchName/merge', isContributor, mergeBranch);

export default router;
