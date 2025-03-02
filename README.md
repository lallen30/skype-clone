# Skype Clone - React Frontend

A React-based frontend for a Skype-like chat application with real-time messaging capabilities using Socket.io.

## Features

- User authentication (login/register)
- Real-time messaging with Socket.io
- Contact list with online status indicators
- Group chat support
- Message read receipts
- Typing indicators
- Responsive design for mobile and desktop
- Material UI components for a polished interface

## Tech Stack

- React 19
- TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Socket.io for real-time communication
- Material UI for components
- Vite for fast development and building

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skype-clone.git
   cd skype-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   VITE_SOCKET_ENDPOINT=http://localhost:3001
   ```

### Development

Start the development server:

```bash
npm run dev
```

This will start the application on http://localhost:5173.

### Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Docker Deployment

You can also run the application using Docker:

1. Build the Docker image:
   ```bash
   docker build -t skype-clone .
   ```

2. Run the container:
   ```bash
   docker run -p 80:80 skype-clone
   ```

The application will be available at http://localhost.

## Testing

To test the application, follow these steps:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to http://localhost:5173

3. You will be redirected to the login page. Use the following credentials:
   - Email: john@example.com
   - Password: password

4. After logging in, you'll see the chat interface with mock conversations.

5. Click on a conversation to view and send messages.

## Future Enhancements

- Implement actual file sharing functionality
- Add video and audio calling features
- Implement user profile customization
- Add notification system
- Integrate with a real backend API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
