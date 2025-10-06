import express from 'express';
import { authenticate } from '../middleware/auth.js';
import TeamController from '../controllers/TeamController.js';

const router = express.Router();

router.use(authenticate);

// Team routes
router.get('/members', TeamController.getTeamMembers);
router.put('/members/:id', TeamController.updateTeamMember);
router.delete('/members/:id', TeamController.deleteTeamMember);
router.put('/members/:id/role', TeamController.updateTeamMemberRole);

export default router;