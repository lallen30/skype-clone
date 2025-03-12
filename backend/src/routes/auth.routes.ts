import express, { RequestHandler } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register a new user
router.post('/register', register as RequestHandler);

// Login user
router.post('/login', login as RequestHandler);

// Get current user (protected route)
router.get('/me', authMiddleware as RequestHandler, getCurrentUser as RequestHandler);

// Logout user (protected route)
router.post('/logout', authMiddleware as RequestHandler, logout as RequestHandler);

export default router;
