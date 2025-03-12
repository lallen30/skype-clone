import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes and middleware with .js extension for ES modules
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import fileRoutes from './routes/file.routes.js';

// Import middleware
import { errorHandler } from './middleware/error.middleware.js';
import { socketAuthMiddleware } from './middleware/socket.middleware.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Apply Socket.io middleware for authentication
io.use(socketAuthMiddleware);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up file uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/files', fileRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Get user ID from socket data (set by auth middleware)
  const userId = socket.data.userId;
  console.log(`Authenticated user connected: ${userId}`);
  
  // Join a conversation room
  socket.on('join_conversation', (data) => {
    const { conversationId } = data;
    socket.join(conversationId);
    console.log(`User ${userId} joined conversation: ${conversationId}`);
  });
  
  // Leave a conversation room
  socket.on('leave_conversation', (data) => {
    const { conversationId } = data;
    socket.leave(conversationId);
    console.log(`User ${userId} left conversation: ${conversationId}`);
  });
  
  // Handle sending messages
  socket.on('send_message', async (messageData) => {
    try {
      // The message will be saved by the API endpoint
      // Here we just broadcast it to the conversation room
      io.to(messageData.conversationId).emit('message', {
        ...messageData,
        senderId: userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(conversationId).emit('typing', {
      userId,
      conversationId,
      isTyping
    });
  });
  
  // Handle user status changes
  socket.on('status_change', (data) => {
    const { status } = data;
    // Broadcast to all connected clients
    socket.broadcast.emit('user_status_change', {
      userId,
      status
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const PORT = process.env.PORT || 3001;
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/skype-clone';

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
