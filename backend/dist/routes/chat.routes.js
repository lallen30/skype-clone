import express from 'express';
import { createConversation, getUserConversations, getConversationById, sendMessage, getConversationMessages, markMessagesAsRead, addUserToGroup, removeUserFromGroup } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = express.Router();
// Apply auth middleware to all routes
router.use(authMiddleware);
// Conversation routes
router.post('/conversations', createConversation);
router.get('/conversations', getUserConversations);
router.get('/conversations/:id', getConversationById);
// Message routes
router.post('/messages', sendMessage);
router.get('/messages/:conversationId', getConversationMessages);
router.post('/messages/:conversationId/read', markMessagesAsRead);
// Group management routes
router.post('/conversations/:conversationId/users', addUserToGroup);
router.delete('/conversations/:conversationId/users/:userId', removeUserFromGroup);
export default router;
//# sourceMappingURL=chat.routes.js.map