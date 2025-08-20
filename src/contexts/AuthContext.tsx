import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { User } from '../types/interface';

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if we have OAuth callback parameters
      if (AuthService.hasOAuthCallback()) {
        console.log('🔄 Processing OAuth callback...');
        const result = await AuthService.handleOAuthCallback();
        
        if (result.success && result.data) {
          setUser(result.data.user);
          console.log('✅ OAuth login successful');
        } else {
          console.error('❌ OAuth login failed:', result.message);
          // You might want to show a toast notification here
        }
      } else {
        // Check if user is already logged in
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await AuthService.login(email, password);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      const result = await AuthService.register(userData);
      
      if (result.success && result.data) {
        // Auto-login after successful registration
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const loginWithOAuth = (provider: 'Google' | 'GitHub' = 'Google') => {
    AuthService.initiateOAuthLogin(provider);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    loginWithOAuth,
    logout,
    isAuthenticated: !!user && AuthService.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};