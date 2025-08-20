import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppLoader } from './AppLoader';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while auth is being determined
  if (isLoading) {
    return <AppLoader variant="page" message="Verifying authentication..." />;
  }

  // If not authenticated, redirect to auth page with return URL
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while auth is being determined
  if (isLoading) {
    return <AppLoader variant="auth" message="Checking authentication status..." />;
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public component (auth page)
  return <>{children}</>;
};