import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import OrganizationController from '../controllers/OrganizationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Organization routes
router.post('/', OrganizationController.createOrganization);
router.get('/me', OrganizationController.getUserOrganization);
router.get('/:id', OrganizationController.getOrganizationById);
router.post('/:id/join', OrganizationController.joinOrganization);
router.put('/:id', OrganizationController.updateOrganization);
router.delete('/:id', OrganizationController.deleteOrganization);

// Organization member management
router.post('/:id/members', OrganizationController.addMember);
router.delete('/:id/members', OrganizationController.removeMember);
router.put('/:id/members/role', OrganizationController.updateMemberRole);
router.get('/:id/members', OrganizationController.getOrganizationMembers);

// Admin routes
router.get('/', authenticate, authorize('admin'), OrganizationController.getAllOrganizations);

export default router;