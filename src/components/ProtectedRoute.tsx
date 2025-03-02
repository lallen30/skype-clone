import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';
import { RootState } from '../store';
import { getCurrentUser } from '../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
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
        // In development mode, we can still try to authenticate
        if (import.meta.env.DEV) {
          dispatch(getCurrentUser());
        }
      }
    }
  }, [isAuthenticated, loading, user, dispatch]);
  
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
