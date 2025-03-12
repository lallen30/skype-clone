# Skype Clone Backend

This is the backend server for the Skype Clone chat application. It provides REST APIs and Socket.io integration for real-time chat functionality.

## Features

- User authentication (register, login, logout)
- User profile management
- Direct and group conversations
- Real-time messaging with Socket.io
- File sharing (images, videos, documents)
- User presence (online status)
- Message read receipts

## Tech Stack

- Node.js
- Express
- TypeScript
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Prerequisites

- Node.js (v16+)
- MongoDB (local or remote)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration

## Development

To start the development server with hot-reloading:

```
npm run dev
```

The server will be available at http://localhost:3001 (or the port specified in your .env file).

## Building for Production

To build the application for production:

```
npm run build
```

This will create a `dist` directory with the compiled JavaScript files.

## Running in Production

To run the application in production mode:

```
npm start
```

## Docker

### Building the Docker Image

```
npm run docker:build
```

### Running with Docker

```
npm run docker:run
```

### Using Docker Compose

To run the entire application stack (frontend, backend, and MongoDB):

```
docker-compose up
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout a user

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile
- `POST /api/users/avatar` - Update user avatar
- `PATCH /api/users/status/update` - Update user status

### Conversations

- `POST /api/chats/conversations` - Create a new conversation
- `GET /api/chats/conversations` - Get all conversations for current user
- `GET /api/chats/conversations/:id` - Get conversation by ID
- `POST /api/chats/conversations/:conversationId/users` - Add user to group
- `DELETE /api/chats/conversations/:conversationId/users/:userId` - Remove user from group

### Messages

- `POST /api/chats/messages` - Send a message
- `GET /api/chats/messages/:conversationId` - Get messages for a conversation

### Files

- `POST /api/files/upload` - Upload a file
- `GET /api/files/:id` - Get file by ID

## Socket.io Events

### Client to Server

- `joinRoom` - Join a conversation room
- `leaveRoom` - Leave a conversation room
- `message` - Send a message
- `typing` - Send typing indicator
- `fileShared` - Notify when a file is shared

### Server to Client

- `message` - Receive a message
- `typing` - Receive typing indicator
- `fileShared` - Receive file shared notification

## Future Improvements

- Add email verification
- Implement password reset functionality
- Add video/audio call features
- Implement message reactions
- Add message search functionality
- Implement message deletion and editing
- Add end-to-end encryption
- Implement push notifications
