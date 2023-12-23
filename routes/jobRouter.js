import { Router } from 'express';
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJob,
  updateJob,
} from '../controllers/jobController.js';
import { validateJobInput } from '../middleware/validationMiddleware.js';
import { checkForTestUser } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/')
  .get(getAllJobs)
  .post(checkForTestUser, validateJobInput, createJob);

router
  .route('/:id')
  .get(getJob)
  .patch(checkForTestUser, validateJobInput, updateJob)
  .delete(checkForTestUser, deleteJob);

export default router;
