import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';
import apiService from '../services/apiService';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(email, password);
      try {
        localStorage.setItem('token', response.token);
      } catch (storageError) {
        console.warn('Could not access localStorage:', storageError);
        // Continue without storing the token
      }
      return response.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.register(username, email, password);
      try {
        localStorage.setItem('token', response.token);
      } catch (storageError) {
        console.warn('Could not access localStorage:', storageError);
        // Continue without storing the token
      }
      return response.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      let token;
      try {
        token = localStorage.getItem('token');
      } catch (storageError) {
        console.warn('Could not access localStorage:', storageError);
        // Mock token for development if needed
        if (import.meta.env.DEV) {
          token = 'dev-mock-token';
        } else {
          throw new Error('No token found');
        }
      }
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const user = await apiService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'auth/updateUserStatus',
  async (status: User['status'], { rejectWithValue }) => {
    try {
      const user = await apiService.updateUserStatus(status);
      return user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem('token');
      } catch (error) {
        console.warn('Could not access localStorage:', error);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
        if (state.user) {
          state.user.status = action.payload.status;
        }
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
