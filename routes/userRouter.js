import { Router } from 'express';
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from '../controllers/userController.js';
import { authorizePermissions } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';
import { checkForTestUser } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile', getCurrentUser);
router.get('/admin/app-stats', [
  authorizePermissions('admin'),
  getApplicationStats,
]);
router.patch(
  '/update-user',
  checkForTestUser,
  upload.single('avatar'),
  updateUser
);

export default router;
