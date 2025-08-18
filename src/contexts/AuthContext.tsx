import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import type { LoginRequest, User } from '../types/interface';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  login: async() => {},
  loading: true,
  logout: () => {},
  user: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!AuthService.getToken();
  });

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = AuthService.getUser();
    const token = AuthService.getToken();
    
    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await AuthService.login(credentials);
      console.log(response.data)
      console.log(response.data.email)
      if (response.success && response.data) {
        const userData: User = {
          email: response.data.email,
          id: response.data.id,
          name: response.data.email.split('@')[0] // Use email username as name fallback
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Listen to localStorage changes from other tabs/windows
  useEffect(() => {
    const onStorage = () => {
      const token = AuthService.getToken();
      const storedUser = AuthService.getUser();
      
      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = {
    user,
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};