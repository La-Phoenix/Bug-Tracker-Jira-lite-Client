import { API_SERVER_BASE_URL } from "../utils/constants";
import { AuthService } from "./authService";
import type { Label } from '../types/interface';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export class LabelService {
  private static handleAuthError() {
    AuthService.logout();
    window.location.href = '/auth';
  }

  // GET /api/labels - Get all labels
  static async getAllLabels(): Promise<ApiResponse<Label[]>> {
    try {
      console.log('🔄 Fetching all labels...');
      
      const response = await fetch(`${API_SERVER_BASE_URL}/labels`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Labels fetched successfully:', result.data?.length || 0, 'labels');

      return {
        success: result.success,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error fetching labels:', error);
      return {
        success: false,
        message: 'Failed to fetch labels'
      };
    }
  }

  // GET /api/labels/:id - Get label by ID
  static async getLabelById(id: number): Promise<ApiResponse<Label>> {
    try {
      console.log('🔄 Fetching label by ID:', id);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/labels/${id}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 404) {
          return { success: false, message: 'Label not found' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Label fetched successfully:', result.data?.name);

      return {
        success: result.success,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error fetching label:', error);
      return {
        success: false,
        message: 'Failed to fetch label'
      };
    }
  }

  // POST /api/labels - Create new label (Admin only)
  static async createLabel(labelData: { name: string; color: string }): Promise<ApiResponse<Label>> {
    try {
      console.log('🔄 Creating label:', labelData.name);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/labels`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 403) {
          return { success: false, message: 'Admin access required' };
        }
        
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to create label'
        };
      }

      const result = await response.json();
      console.log('✅ Label created successfully:', result.data?.name);

      return {
        success: result.success,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error creating label:', error);
      return {
        success: false,
        message: 'Failed to create label'
      };
    }
  }

  // PUT /api/labels/:id - Update label (Admin only)
  static async updateLabel(id: number, labelData: { name?: string; color?: string }): Promise<ApiResponse<Label>> {
    try {
      console.log('🔄 Updating label ID:', id, labelData);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/labels/${id}`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 403) {
          return { success: false, message: 'Admin access required' };
        }
        if (response.status === 404) {
          return { success: false, message: 'Label not found' };
        }
        
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to update label'
        };
      }

      const result = await response.json();
      console.log('✅ Label updated successfully:', result.data?.name);

      return {
        success: result.success,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error updating label:', error);
      return {
        success: false,
        message: 'Failed to update label'
      };
    }
  }

  // DELETE /api/labels/:id - Delete label (Admin only)
  static async deleteLabel(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('🔄 Deleting label ID:', id);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/labels/${id}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 403) {
          return { success: false, message: 'Admin access required' };
        }
        if (response.status === 404) {
          return { success: false, message: 'Label not found' };
        }
        
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to delete label'
        };
      }

      const result = await response.json();
      console.log('✅ Label deleted successfully');

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error deleting label:', error);
      return {
        success: false,
        message: 'Failed to delete label'
      };
    }
  }

  // POST /api/issues/:issueId/labels/:labelId - Add label to issue
  static async addLabelToIssue(issueId: number, labelId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🔄 Adding label', labelId, 'to issue', issueId);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/${issueId}/labels/${labelId}`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 404) {
          return { success: false, message: 'Issue or label not found' };
        }
        
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to add label to issue'
        };
      }

      const result = await response.json();
      console.log('✅ Label added to issue successfully');

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error adding label to issue:', error);
      return {
        success: false,
        message: 'Failed to add label to issue'
      };
    }
  }

  // DELETE /api/issues/:issueId/labels/:labelId - Remove label from issue
  static async removeLabelFromIssue(issueId: number, labelId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🔄 Removing label', labelId, 'from issue', issueId);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/${issueId}/labels/${labelId}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 404) {
          return { success: false, message: 'Issue or label not found' };
        }
        
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to remove label from issue'
        };
      }

      const result = await response.json();
      console.log('✅ Label removed from issue successfully');

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error removing label from issue:', error);
      return {
        success: false,
        message: 'Failed to remove label from issue'
      };
    }
  }

  // GET /api/issues/label/:labelId - Get issues by label
  static async getIssuesByLabel(labelId: number): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔄 Fetching issues for label ID:', labelId);
      
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/label/${labelId}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return { success: false, message: 'Authentication required' };
        }
        if (response.status === 404) {
          return { success: false, message: 'Label not found' };
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Issues by label fetched successfully:', result.data?.length || 0, 'issues');

      return {
        success: result.success,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error fetching issues by label:', error);
      return {
        success: false,
        message: 'Failed to fetch issues by label'
      };
    }
  }
}