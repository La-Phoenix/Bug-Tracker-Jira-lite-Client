import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { User } from '../types/interface';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string, error?: string; }>;
  register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string, error?: string }>;
  loginWithOAuth: (provider?: 'Google' | 'GitHub') => void;
  logout: () => void;
  isAuthenticated: boolean;
  setAuthenticatedState: (userData: User, authToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Computed property for authentication status
   const isAuthenticated = React.useMemo(() => {
    // Basic checks first
    if (!user || !token) {
      console.log('❌ Auth check failed: missing user or token', { user: !!user, token: !!token });
      return false;
    }
    
    // Check if token is valid using AuthService
    const serviceAuthCheck = AuthService.isAuthenticated();
    console.log('🔍 AuthService.isAuthenticated():', serviceAuthCheck);
    
    if (!serviceAuthCheck) {
      console.log('❌ Auth check failed: AuthService says not authenticated');
      return false;
    }
    
    console.log('✅ Authentication check passed');
    return true;
  }, [user, token]);

  // Effect to handle navigation after authentication state changes
  useEffect(() => {
    if (pendingNavigation && user && token && !isLoading) {
      console.log('🔄 Executing pending navigation to:', pendingNavigation);
      navigate(pendingNavigation, { replace: true });
      setPendingNavigation(null);
    }
  }, [user, token, isLoading, pendingNavigation, navigate]);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Helper function to set authenticated state
  const setAuthenticatedState = useCallback((userData: User, authToken?: string, shouldNavigate: boolean = false) => {
    console.log('✅ Setting authenticated state for:', userData.email);
    setUser(userData);
    if (authToken) setToken(authToken);
    
    if (shouldNavigate) {
      const targetPath = location.state?.from?.pathname || '/dashboard';
      console.log('🔄 Setting pending navigation to:', targetPath);
      setPendingNavigation(targetPath);
    }
  }, [location.state]);

  // Helper function to clear authenticated state
  const clearAuthenticatedState = useCallback(() => {
    setUser(null);
    setToken(null);
    setPendingNavigation(null);
    console.log('🔄 User state cleared');
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing authentication...');
      
      // Check if we have OAuth callback parameters first
      if (AuthService.hasOAuthCallback()) {
        console.log('🔄 Processing OAuth callback...');
        
        const result = await AuthService.handleOAuthCallback();
        
        if (result.success && result.data) {
          const user = result.data as User;
          delete (user as any).token;
          setAuthenticatedState(user, result.data.token, true); // Navigate after OAuth
          console.log('✅ OAuth login successful for:', result.data.email);
        } else {
          console.error('❌ OAuth login failed:', result.message);
        }
      } else {
        // Check if user is already logged in (regular auth or previous OAuth)
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          const currentToken = AuthService.getToken();
          
          if (currentUser && currentToken) {
            // Don't navigate during initialization - let route guards handle it
            setUser(currentUser);
            setToken(currentToken);
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
        const user = result.data as User;
        delete (user as any).token;
        
        // Use the helper function with navigation
        setAuthenticatedState(user, result.data.token, true);
        console.log('✅ Login successful for:', result.data.email);
        
        return { success: true };
      } else {
        console.error('❌ Login failed:', result.message);
        return { success: false, message: result.message, error: result.error };
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
        const user = result.data as User;
        delete (user as any).token;
        
        // Use the helper function with navigation
        setAuthenticatedState(user, result.data.token, true);
        console.log('✅ Registration and auto-login successful for:', result.data.email);
        
        return { success: true };
      } else {
        console.error('❌ Registration failed:', result.message);
        return { success: false, message: result.message, error: result.error };
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
    navigate('/auth', { replace: true });
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    loginWithOAuth,
    logout,
    isAuthenticated,
    setAuthenticatedState: (userData: User, authToken?: string) => setAuthenticatedState(userData, authToken, false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export both as named exports
export { AuthProvider, useAuth };