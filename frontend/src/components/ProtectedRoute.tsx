import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { CircularProgress, Box } from '@mui/material';
import { RootState } from '../store';
import { getCurrentUser } from '../store/authSlice';
import socketService from '../services/socketService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated && !loading && !user) {
      // Try to authenticate with token if it exists
      try {
        const token = localStorage.getItem('token');
        if (token) {
          dispatch(getCurrentUser());
        }
      } catch (error) {
        console.warn('Could not access localStorage:', error);
      }
    }
  }, [isAuthenticated, loading, user, dispatch]);
  
  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          socketService.connect(token);
        }
      } catch (error) {
        console.error('Failed to initialize socket connection:', error);
      }
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
