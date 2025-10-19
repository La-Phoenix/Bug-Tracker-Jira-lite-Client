import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppLoader } from './AppLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while auth is being determined
  if (isLoading) {
    return <AppLoader variant="auth" message="Checking authentication..." />;
  }

  // Double check authentication
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'user:', !!user);
  
  // If not authenticated, redirect to auth page with return URL
  if (!isAuthenticated || !user) {
    console.log('🔄 Redirecting to auth from:', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while auth is being determined
  if (isLoading) {
    return <AppLoader variant="auth" message="Checking authentication status..." />;
  }

  console.log('PublicRoute - isAuthenticated:', isAuthenticated, 'user:', !!user);
  
  // If authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    console.log('🔄 User is authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public component (auth page)
  return <>{children}</>;
};