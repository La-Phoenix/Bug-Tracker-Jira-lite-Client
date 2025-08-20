import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { User } from '../types/interface';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  loginWithOAuth: (provider?: 'Google' | 'GitHub') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Helper function to set authenticated state
  const setAuthenticatedState = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    // Token is already stored in localStorage by AuthService
    console.log('✅ User authenticated:', userData.email);
  };

  // Helper function to clear authenticated state
  const clearAuthenticatedState = () => {
    setUser(null);
    setToken(null);
    console.log('🔄 User state cleared');
  };

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing authentication...');
      
      // Check if we have OAuth callback parameters first
      if (AuthService.hasOAuthCallback()) {
        console.log('🔄 Processing OAuth callback...');
        
        const result = await AuthService.handleOAuthCallback();
        
        if (result.success && result.data) {
          setAuthenticatedState(result.data.user, result.data.token);
          console.log('✅ OAuth login successful for:', result.data.user.email);
        } else {
          console.error('❌ OAuth login failed:', result.message);
        }
      } else {
        // Check if user is already logged in (regular auth or previous OAuth)
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          const currentToken = AuthService.getToken();
          
          if (currentUser && currentToken) {
            setAuthenticatedState(currentUser, currentToken);
            console.log('✅ User already authenticated:', currentUser.email);
          }
        }
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    } finally {
      // Always set loading to false after initialization
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      const result = await AuthService.login(email, password);
      
      if (result.success && result.data) {
        setAuthenticatedState(result.data.user, result.data.token);
        console.log('✅ Login successful for:', result.data.user.email);
        return { success: true };
      } else {
        console.error('❌ Login failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      console.log('🔄 Attempting registration for:', userData.email);
      
      const result = await AuthService.register(userData);
      
      if (result.success && result.data) {
        // Auto-login after successful registration
        setAuthenticatedState(result.data.user, result.data.token);
        console.log('✅ Registration and auto-login successful for:', result.data.user.email);
        return { success: true };
      } else {
        console.error('❌ Registration failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const loginWithOAuth = (provider: 'Google' | 'GitHub' = 'Google') => {
    console.log('🔄 Initiating OAuth login with:', provider);
    AuthService.initiateOAuthLogin(provider);
  };

  const logout = () => {
    console.log('🔄 Logging out user');
    AuthService.logout();
    clearAuthenticatedState();
  };

  // Computed property for authentication status
  const isAuthenticated = !!user && !!token && AuthService.isAuthenticated();

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    loginWithOAuth,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};