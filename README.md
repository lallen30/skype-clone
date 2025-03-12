# Skype Clone

A full-stack chat application inspired by Skype, featuring real-time messaging, user authentication, file sharing, and more.

## Project Structure

This project is organized into two main components:

- **Frontend**: React application with TypeScript, Material UI, and Redux
- **Backend**: Node.js/Express server with TypeScript, Socket.io, and MongoDB

## Features

- User authentication (register, login, logout)
- User profile management
- Direct and group conversations
- Real-time messaging with Socket.io
- File sharing (images, videos, documents)
- User presence (online status)
- Message read receipts
- Responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- Material UI
- Redux Toolkit
- React Router
- Socket.io Client

### Backend
- Node.js
- Express
- TypeScript
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or remote)
- npm or yarn

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The frontend will be available at http://localhost:3000

### Running the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration
5. Start the development server:
   ```
   npm run dev
   ```
6. The backend will be available at http://localhost:3001

## Docker Deployment

To run the entire application stack (frontend, backend, and MongoDB) using Docker:

```
docker-compose up
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001
- MongoDB on port 27017

## Development

### Frontend Development

The frontend is built with React and uses Vite as the build tool. It's structured with:

- Components: Reusable UI elements
- Pages: Main application views
- Services: API communication
- Store: Redux state management
- Types: TypeScript type definitions

### Backend Development

The backend follows a structured architecture:

- Routes: API endpoint definitions
- Controllers: Request handling logic
- Models: Data schemas
- Middleware: Request processing functions
- Services: Business logic
- Utils: Helper functions

## API Documentation

See the [Backend README](/backend/README.md) for detailed API documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Skype's functionality and design
- Built with modern web technologies
- Designed for learning and demonstration purposes
