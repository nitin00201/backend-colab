import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  getChatHistory,
  sendMessage,
  markAsRead,
  deleteChat,
  findDirectChat
} from '../controllers/ChatController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Chat routes
router.post('/', createChatRoom);
router.get('/', getChatRooms);
router.get('/direct/:participantId', findDirectChat); // Add route to find existing direct chat
router.get('/:id', getChatRoomById);
router.get('/:id/messages', getChatHistory);
router.post('/:id/messages', sendMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteChat); // Add delete route

export default router;