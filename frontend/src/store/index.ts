import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['chat/fetchConversations/fulfilled', 'chat/fetchMessages/fulfilled', 'chat/sendMessage/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.createdAt', 'payload.updatedAt', 'payload.lastSeen', 'meta.arg.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: [
          'chat.conversations',
          'chat.activeConversation',
          'chat.messages'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
