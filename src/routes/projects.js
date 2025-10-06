import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/ProjectController.js';

const router = express.Router();

router.use(authenticate);

// Project routes
router.post('/', createProject);
router.get('/', getUserProjects);
router.get('/:projectId', getProjectById);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);
router.post('/:projectId/members', addMember);
router.delete('/:projectId/members/:userId', removeMember);

export default router;