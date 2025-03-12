import { User, Conversation, Message, Attachment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function to format dates in responses
const formatDates = <T extends object>(obj: T): T => {
  const formatted = { ...obj };
  
  Object.entries(formatted).forEach(([key, value]) => {
    // Convert date strings to Date objects
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      (formatted as any)[key] = new Date(value);
    } 
    // Handle nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (formatted as any)[key] = formatDates(value as object);
    }
    // Handle arrays of objects
    else if (Array.isArray(value)) {
      (formatted as any)[key] = value.map(item => 
        typeof item === 'object' && item !== null ? formatDates(item) : item
      );
    }
  });
  
  return formatted;
};

class ApiService {
  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(handleResponse);
    
    return {
      user: formatDates(response.user),
      token: response.token
    };
  }
  
  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    }).then(handleResponse);
    
    return {
      user: formatDates(response.user),
      token: response.token
    };
  }
  
  // User methods
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  async updateUserStatus(status: User['status']): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers,
      body: formData
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  // Conversation methods
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
      method: 'GET',
      headers: getAuthHeaders()
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  async getConversationById(id: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/chats/conversations/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  async createConversation(participants: string[], isGroup: boolean, name?: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ participants, isGroup, name })
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  // Message methods
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/chats/messages/${conversationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    }).then(handleResponse);
    
    return formatDates(response);
  }
  
  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<Message> {
    if (attachments && attachments.length > 0) {
      // If there are attachments, use FormData
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', content);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : ''
      };
      
      const response = await fetch(`${API_BASE_URL}/chats/messages`, {
        method: 'POST',
        headers,
        body: formData
      }).then(handleResponse);
      
      return formatDates(response);
    } else {
      // No attachments, use JSON
      const response = await fetch(`${API_BASE_URL}/chats/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ conversationId, content })
      }).then(handleResponse);
      
      return formatDates(response);
    }
  }
  
  async markMessagesAsRead(conversationId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/chats/messages/${conversationId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse);
  }
  
  // File methods
  async uploadFile(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers,
      body: formData
    }).then(handleResponse);
    
    return response;
  }
}

export default new ApiService();
