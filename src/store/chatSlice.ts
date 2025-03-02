import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Conversation, Message } from '../types';
import apiService from '../services/apiService';

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  loading: false,
  error: null
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const conversations = await apiService.getConversations();
      return conversations;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const messages = await apiService.getMessages(conversationId);
      return { conversationId, messages };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content }: { conversationId: string; content: string }, { rejectWithValue }) => {
    try {
      const message = await apiService.sendMessage(conversationId, content);
      return message;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await apiService.markMessagesAsRead(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participants, isGroup, name }: { participants: string[]; isGroup: boolean; name?: string }, { rejectWithValue }) => {
    try {
      const conversation = await apiService.createConversation(participants, isGroup, name);
      return conversation;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      try {
        console.log('Setting active conversation with ID:', action.payload);
        console.log('Available conversations:', state.conversations);
        
        const conversation = state.conversations.find(c => c.id === action.payload);
        console.log('Found conversation:', conversation);
        
        if (conversation) {
          // Create a deep copy to ensure all properties are properly copied
          state.activeConversation = JSON.parse(JSON.stringify(conversation));
          console.log('Set active conversation:', state.activeConversation);
        } else {
          console.error('Conversation not found with ID:', action.payload);
        }
      } catch (error) {
        console.error('Error in setActiveConversation:', error);
      }
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
    },
    receiveMessage: (state, action: PayloadAction<Message>) => {
      const { conversationId } = action.payload;
      
      // Add message to messages
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);
      
      // Update conversation
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = new Date();
        
        // Increment unread count if not active conversation
        if (!state.activeConversation || state.activeConversation.id !== conversationId) {
          conversation.unreadCount += 1;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        const { conversationId } = action.payload;
        
        // Add message to messages
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(action.payload);
        
        // Update conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.lastMessage = action.payload;
          conversation.updatedAt = new Date();
        }
      })
      
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        const conversationId = action.payload;
        
        // Mark messages as read
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].map(message => ({
            ...message,
            isRead: true
          }));
        }
        
        // Update conversation unread count
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
      })
      
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
        state.conversations.push(action.payload);
        state.activeConversation = action.payload;
      });
  }
});

export const { setActiveConversation, clearActiveConversation, receiveMessage, clearError } = chatSlice.actions;
export default chatSlice.reducer;
