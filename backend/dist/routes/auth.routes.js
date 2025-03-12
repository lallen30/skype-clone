import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();
// Register a new user
router.post('/register', register);
// Login user
router.post('/login', login);
// Get current user (protected route)
router.get('/me', authMiddleware, getCurrentUser);
// Logout user (protected route)
router.post('/logout', authMiddleware, logout);
export default router;
//# sourceMappingURL=auth.routes.js.map