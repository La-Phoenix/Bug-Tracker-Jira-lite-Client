import { AuthService } from './authService';
import type { ApiResponse, NotificationPreferences, UserPreferences, UserProfile } from '../types/interface';
import { API_SERVER_BASE_URL } from '../utils/constants';

export class SettingsService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_SERVER_BASE_URL}${endpoint}`;
      console.log('Making request to:', url);

      // 🧠 Only set JSON content-type if the body is not FormData
      const isFormData = options.body instanceof FormData;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
          ...AuthService.getAuthHeaders(),
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        console.log(responseData)
        const message = responseData.errors && (responseData.errors.length !== 0)? responseData.errors.join(". ") : responseData.message;
        throw new Error(message);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error(`Settings API Error (${endpoint}):`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        data: null!
      };
    }
  }

  // Profile Management
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/users/profile');
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  static async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    console.log("file: ", file);
    console.log("formData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          // Only include Authorization header, let browser set Content-Type with boundary
          'Authorization': AuthService.getAuthHeaders()['Authorization'] || '',
          // DO NOT set Content-Type - let the browser handle it for FormData
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Handle error response
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('Error response body:', errorText);
        } catch (e) {
          console.log('Could not read error response body');
        }
        
        return {
          success: false,
          message: `HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`,
          statusCode: response.status,
          errors: [`HTTP ${response.status}: ${errorText || 'Unknown error'}`],
          data: null!
        };
      }

      // Check if response has content before parsing JSON
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      console.log('Content-Length:', contentLength);
      console.log('Content-Type:', contentType);

      // Always try to parse JSON response for successful uploads
      const responseData = await response.json();
      console.log("responseData: ", responseData)
      console.log('Success response data:', responseData);
      
      return {
        success: true,
        message: 'Avatar uploaded successfully',
        statusCode: 200,
        data: responseData.data,
        errors: []
      };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload avatar',
        statusCode: 500,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        data: null!
      };
    }
  }


  static async deleteAvatar(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/users/avatar', {
      method: 'DELETE',
    });
  }

  // Notification Settings
  static async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>('/users/notifications/preferences');
  }

  static async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>('/users/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Security
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Preferences (for appearance settings)
  static async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.makeRequest<UserPreferences>('/users/preferences');
  }

  static async updateUserPreferences(
    preferences: UserPreferences
  ): Promise<ApiResponse<UserPreferences>> {
    return this.makeRequest<UserPreferences>('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Data Export (placeholder for future implementation)
  static async exportUserData(): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return this.makeRequest<{ downloadUrl: string; expiresAt: string }>('/users/export', {
      method: 'POST',
    });
  }

  // Delete Account (placeholder for future implementation)
  static async deleteAccount(password: string): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password, confirmDeletion: true }),
    });
  }
}