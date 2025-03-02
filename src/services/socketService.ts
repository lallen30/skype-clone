import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token: string): void {
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_ENDPOINT || 'http://localhost:3001';
      
      // Don't attempt connection in development if no server is running
      if (import.meta.env.DEV) {
        console.log('Socket connection skipped in development mode');
        return;
      }
      
      this.socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'], // Allow fallback to polling
        reconnectionAttempts: 3,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public onMessage(callback: (message: Message) => void): void {
    if (!this.socket) return;
    this.socket.on('message', callback);
  }

  public onUserStatusChange(callback: (data: { userId: string; status: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('user_status_change', callback);
  }

  public onTyping(callback: (data: { userId: string; conversationId: string; isTyping: boolean }) => void): void {
    if (!this.socket) return;
    this.socket.on('typing', callback);
  }

  public sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): void {
    if (!this.socket) {
      console.log('Would send message (socket not connected):', message);
      return;
    }
    this.socket.emit('send_message', message);
  }

  public sendTypingStatus(conversationId: string, isTyping: boolean): void {
    if (!this.socket) {
      console.log('Would send typing status (socket not connected):', { conversationId, isTyping });
      return;
    }
    this.socket.emit('typing', { conversationId, isTyping });
  }

  public joinConversation(conversationId: string): void {
    if (!this.socket) {
      console.log(`Would join conversation ${conversationId} (socket not connected)`);
      return;
    }
    this.socket.emit('join_conversation', { conversationId });
  }

  public leaveConversation(conversationId: string): void {
    if (!this.socket) {
      console.log(`Would leave conversation ${conversationId} (socket not connected)`);
      return;
    }
    this.socket.emit('leave_conversation', { conversationId });
  }
}

export default SocketService.getInstance();
