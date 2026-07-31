import { Router } from 'express';
import {
  createFile,
  updateFile,
  deleteFile,
  getFileContent,
  getFileTree,
  uploadBulkFiles,
} from '../controllers/fileController.js';
import auth from '../middleware/auth.js';

import { hasRepositoryAccess, isContributor } from '../middleware/repositoryAccess.js';

const router = Router({ mergeParams: true }); // mergeParams to access :repoId

router.use(auth);

router.route('/')
  .get(hasRepositoryAccess, getFileTree)
  .post(isContributor, createFile);

router.post('/bulk', isContributor, uploadBulkFiles);

router.route('/:fileId')
  .get(hasRepositoryAccess, getFileContent)
  .put(isContributor, updateFile)
  .delete(isContributor, deleteFile);

export default router;
