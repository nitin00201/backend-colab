import express from 'express';
import AuthController from '../controllers/AuthController.js';
import UserController from '../controllers/UserController.js';
import TeamController from '../controllers/TeamController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// Import routes
import notificationRoutes from './notifications.js';
import chatRoutes from './chat.js';
import taskRoutes from './tasks.js';
import projectRoutes from './projects.js';
import documentRoutes from './documents.js';
import inngestRoutes from './inngest.js';
import organizationRoutes from './organizations.js';
import teamRoutes from './teams.js';
import emailRoutes from './emails.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'monolith-app-api'
  });
});

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.get('/users', authenticate, UserController.getAllUsers);
router.get('/users/:id', authenticate, UserController.getUserById);
router.put('/users/:id', authenticate, UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);
router.put('/users/:id/role', UserController.updateUserRole);

// Team routes
router.get('/team/members', authenticate, TeamController.getTeamMembers);
router.put('/team/members/:id', authenticate, TeamController.updateTeamMember);
router.delete('/team/members/:id', authenticate, TeamController.deleteTeamMember);
router.put('/team/members/:id/role', authenticate, TeamController.updateTeamMemberRole);

// Notification routes
router.use('/notifications', notificationRoutes);

// Chat routes
router.use('/chats', chatRoutes);

// Task routes
router.use('/tasks', taskRoutes);

// Project routes
router.use('/projects', projectRoutes);

// Document routes
router.use('/documents', documentRoutes);

// Organization routes
router.use('/organizations', organizationRoutes);

// Team routes
router.use('/teams', teamRoutes);

// Email routes
router.use('/emails', emailRoutes);

// Inngest routes
router.use('/inngest', inngestRoutes);

export default router;