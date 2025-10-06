import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import TeamController from '../controllers/TeamController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Team routes
router.post('/', TeamController.createTeam);
router.get('/', TeamController.getTeamsByOrganization);
router.get('/:id', TeamController.getTeamById);
router.put('/:id', TeamController.updateTeam);
router.delete('/:id', TeamController.deleteTeam);

// Team member management
router.post('/:id/members', TeamController.addMember);
router.delete('/:id/members', TeamController.removeMember);
router.put('/:id/members/role', TeamController.updateMemberRole);
router.get('/:id/members', TeamController.getTeamMembersById);

// Admin routes
router.get('/admin/all',  TeamController.getAllTeams);

// Legacy routes (for backward compatibility)
router.get('/members', TeamController.getTeamMembers);
router.put('/members/:id', TeamController.updateTeamMember);
router.delete('/members/:id', TeamController.deleteTeamMember);
router.put('/members/:id/role', TeamController.updateTeamMemberRole);

export default router;