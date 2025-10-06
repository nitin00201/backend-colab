import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getUserTasks,
} from '../controllers/TaskController.js';

const router = express.Router();

router.use(authenticate);

// Task routes
router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.get('/user', getUserTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;