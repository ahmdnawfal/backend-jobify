import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
} from '../controllers/authController.js';
import {
  validateLoginInput,
  validateRegisterInput,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
