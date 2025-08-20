import type { User } from "../types/interface";
import type { ApiResponse } from "../types/response";
import { API_CLIENT_BASE_URL, API_SERVER_BASE_URL } from "../utils/constants";


export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    email: string;
    role: "User" | "Admin" | undefined;
    id: number;
    name?: string;
  };
  message?: string;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    id: number;
    token: string;
    email: string;
    role: "User" | "Admin" | undefined;
    name?: string;
  };
  message?: string;
  error?: string;
}

class AuthServiceClass {

  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Regular login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json().catch(() => ({ message: 'Login failed' }));
        return {
          success: false,
          message: errorData.message || 'Login failed',
          error: errorData.errors?.map(e => e).join(" ")
        };
      }

      const responseData: LoginResponse = await response.json();
      console.log("login resp", responseData)
      
      if (responseData.data?.token) {
        localStorage.setItem('token', responseData.data.token);
        const user = {email: responseData.data.email, role: responseData.data.role, id: responseData.data.id, name: responseData.data.name || responseData.data.email.split("@")[0] }
        localStorage.setItem('user', JSON.stringify(user));
      }

      return {
        success: true,
        data: responseData.data
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  // Regular register
  async register(userData: { name: string; email: string; password: string }): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json().catch(() => ({ message: 'Registration failed' }));
        return {
          success: false,
          message: errorData.message || 'Registration failed',
          error: errorData.errors?.map(e => e).join(" ")
        };
      }

      const data = await response.json();
      
      // Auto-login after successful registration
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  // OAuth login - redirect to backend OAuth endpoint
  initiateOAuthLogin(provider: 'Google' | 'GitHub' = 'Google'): void {
    const returnUrl = encodeURIComponent(API_CLIENT_BASE_URL);
    const oauthUrl = `${API_SERVER_BASE_URL}/auth/external/${provider}?returnUrl=${returnUrl}`;
    
    console.log('🔄 Initiating OAuth login:', oauthUrl);
    window.location.href = oauthUrl;
  }

  // Handle OAuth callback (called when redirected back from backend)
  handleOAuthCallback(): Promise<LoginResponse> {
    return new Promise((resolve) => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      const message = urlParams.get('message');

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      if (error) {
        console.error('OAuth error:', error, message);
        let errorMessage = 'OAuth login failed';
        
        switch (error) {
          case 'oauth_failed':
            errorMessage = message ? decodeURIComponent(message) : 'OAuth provider authentication failed';
            break;
          case 'auth_failed':
            errorMessage = 'Authentication failed';
            break;
          case 'missing_claims':
            errorMessage = 'Missing required user information from OAuth provider';
            break;
          case 'callback_error':
            errorMessage = 'OAuth callback processing error';
            break;
          default:
            errorMessage = message ? decodeURIComponent(message) : 'OAuth login failed';
        }

        resolve({
          success: false,
          message: errorMessage
        });
        return;
      }

      if (token) {
        try {
          // Decode JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 JWT Payload:', payload);
          
          const user = {
            id: parseInt(payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
            name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || payload.email,
            email: payload.email,
            role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'User',
            createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          console.log('✅ OAuth login successful:', user.email);
          
          resolve({
            success: true,
            data: { token, ...user  }
          });
        } catch (error) {
          console.error('Error processing OAuth token:', error);
          resolve({
            success: false,
            message: 'Failed to process authentication token'
          });
        }
      } else {
        // Added missing else case
        resolve({
          success: false,
          message: 'No authentication token received'
        });
      }
    });
  }


  // Check if current URL has OAuth callback parameters
  hasOAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('token') || urlParams.has('error');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export const AuthService = new AuthServiceClass();