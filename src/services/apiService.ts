import { User, Conversation, Message } from '../types';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    avatar: 'https://mui.com/static/images/avatar/1.jpg',
    status: 'online'
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    avatar: 'https://mui.com/static/images/avatar/2.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: '3',
    username: 'bob_johnson',
    email: 'bob@example.com',
    avatar: 'https://mui.com/static/images/avatar/3.jpg',
    status: 'away'
  },
  {
    id: '4',
    username: 'alice_williams',
    email: 'alice@example.com',
    avatar: 'https://mui.com/static/images/avatar/4.jpg',
    status: 'busy'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    conversationId: '1',
    content: 'Hey there! How are you doing?',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isRead: true
  },
  {
    id: '2',
    senderId: '1',
    conversationId: '1',
    content: 'I\'m good, thanks! Just working on a new project.',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true
  },
  {
    id: '3',
    senderId: '2',
    conversationId: '1',
    content: 'That sounds interesting! What kind of project?',
    timestamp: new Date(Date.now() - 1800000),
    isRead: true
  },
  {
    id: '4',
    senderId: '1',
    conversationId: '1',
    content: 'A chat application similar to Skype. Using React and TypeScript.',
    timestamp: new Date(Date.now() - 900000),
    isRead: false
  },
  {
    id: '5',
    senderId: '3',
    conversationId: '2',
    content: 'Did you see the latest tech news?',
    timestamp: new Date(Date.now() - 7200000),
    isRead: true
  },
  {
    id: '6',
    senderId: '1',
    conversationId: '2',
    content: 'Not yet, what happened?',
    timestamp: new Date(Date.now() - 5400000),
    isRead: true
  },
  {
    id: '7',
    senderId: '4',
    conversationId: '3',
    content: 'Team meeting at 3 PM today.',
    timestamp: new Date(Date.now() - 10800000),
    isRead: true
  },
  {
    id: '8',
    senderId: '1',
    conversationId: '3',
    content: 'Thanks for the reminder!',
    timestamp: new Date(Date.now() - 9000000),
    isRead: true
  }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[1]],
    isGroup: false,
    unreadCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 900000) // 15 minutes ago
  },
  {
    id: '2',
    participants: [mockUsers[0], mockUsers[2]],
    isGroup: false,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 14), // 14 days ago
    updatedAt: new Date(Date.now() - 5400000) // 1.5 hours ago
  },
  {
    id: '3',
    name: 'Project Team',
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    isGroup: true,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 9000000) // 2.5 hours ago
  }
];

// Update last messages
mockConversations[0].lastMessage = mockMessages[3];
mockConversations[1].lastMessage = mockMessages[5];
mockConversations[2].lastMessage = mockMessages[7];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials');
    }
    
    return {
      user,
      token: 'mock-jwt-token'
    };
  }
  
  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(1000);
    
    if (mockUsers.some(u => u.email === email)) {
      throw new Error('Email already in use');
    }
    
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      status: 'online',
      avatar: `https://mui.com/static/images/avatar/${Math.floor(Math.random() * 8) + 1}.jpg`
    };
    
    mockUsers.push(newUser);
    
    return {
      user: newUser,
      token: 'mock-jwt-token'
    };
  }
  
  // User methods
  async getCurrentUser(): Promise<User> {
    await delay(500);
    return mockUsers[0]; // Default to first user
  }
  
  async updateUserStatus(status: User['status']): Promise<User> {
    await delay(300);
    const currentUser = { ...mockUsers[0], status };
    mockUsers[0] = currentUser;
    return currentUser;
  }
  
  // Conversation methods
  async getConversations(): Promise<Conversation[]> {
    await delay(700);
    return mockConversations;
  }
  
  async getConversationById(id: string): Promise<Conversation> {
    await delay(500);
    const conversation = mockConversations.find(c => c.id === id);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return conversation;
  }
  
  async createConversation(participants: string[], isGroup: boolean, name?: string): Promise<Conversation> {
    await delay(1000);
    
    const participantUsers = mockUsers.filter(u => participants.includes(u.id));
    
    if (participantUsers.length !== participants.length) {
      throw new Error('One or more users not found');
    }
    
    const newConversation: Conversation = {
      id: (mockConversations.length + 1).toString(),
      participants: participantUsers,
      isGroup,
      name,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockConversations.push(newConversation);
    
    return newConversation;
  }
  
  // Message methods
  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(600);
    return mockMessages.filter(m => m.conversationId === conversationId);
  }
  
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    await delay(400);
    
    const newMessage: Message = {
      id: (mockMessages.length + 1).toString(),
      senderId: mockUsers[0].id,
      conversationId,
      content,
      timestamp: new Date(),
      isRead: false
    };
    
    mockMessages.push(newMessage);
    
    // Update conversation
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
      conversation.updatedAt = new Date();
    }
    
    return newMessage;
  }
  
  async markMessagesAsRead(conversationId: string): Promise<void> {
    await delay(300);
    
    mockMessages.forEach(message => {
      if (message.conversationId === conversationId && !message.isRead) {
        message.isRead = true;
      }
    });
    
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
  }
}

export default new ApiService();
