import express, { Router, RequestHandler } from 'express';
import {
  createConversation,
  getUserConversations,
  getConversationById,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  addUserToGroup,
  removeUserFromGroup
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware as RequestHandler);

// Conversation routes
router.post('/conversations', createConversation as RequestHandler);
router.get('/conversations', getUserConversations as RequestHandler);
router.get('/conversations/:id', getConversationById as RequestHandler);

// Message routes
router.post('/messages', sendMessage as RequestHandler);
router.get('/messages/:conversationId', getConversationMessages as RequestHandler);
router.post('/messages/:conversationId/read', markMessagesAsRead as RequestHandler);

// Group management routes
router.post('/conversations/:conversationId/users', addUserToGroup as RequestHandler);
router.delete('/conversations/:conversationId/users/:userId', removeUserFromGroup as RequestHandler);

export default router;
