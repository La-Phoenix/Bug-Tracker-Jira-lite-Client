import type { ApiResponse, LoginRequest, LoginResponse, User } from "../types/interface";
import { API_SERVER_BASE_URL } from "../utils/constants";

export const TOKEN_KEY = 'bugtracker_token';
export const USER_KEY = 'bugtracker_user';

export class AuthService {
  // Login user and save token
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_SERVER_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<LoginResponse> = await response.json();
    
    if (result.success && result.data.token) {
        const user : User = {
            email: result.data.email,
            id: result.data.id,
            name: ""
        }
      // Save token and user to localStorage
      localStorage.setItem(TOKEN_KEY, result.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return result;
  }

  // Logout user and clear token
  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get stored user
  static getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get auth headers for API requests
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}