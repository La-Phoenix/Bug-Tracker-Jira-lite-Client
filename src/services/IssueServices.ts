import type { ApiResponse, CreateIssueRequest, Issue, UpdateIssueRequest } from "../types/interface";
import { API_SERVER_BASE_URL } from "../utils/constants";
import { AuthService } from "./authService";

export class IssueService {
  private static handleAuthError() {
    AuthService.logout();
    window.location.href = '/auth';
  }

  // GET /api/issues - Get all issues
  static async getAllIssues(): Promise<ApiResponse<Issue[]>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/issues`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Issues API Response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  // GET /api/issues/my-projects-issues?priorityId=1 - Get all issues from user's projects
  static async getUserProjectsIssues(priorityId?: number): Promise<ApiResponse<Issue[]>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/my-projects-issues${priorityId? "?priorityId=" + priorityId : ""}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Issues API Response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  // GET /api/issues/:id - Get issue by ID
  static async getIssueById(id: number): Promise<ApiResponse<Issue>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/${id}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching issue by ID:', error);
      throw error;
    }
  }

  // POST /api/issues - Create new issue
  static async createIssue(issueData: CreateIssueRequest): Promise<ApiResponse<Issue>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/issues`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Create Issue Response:', data);
      return data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  // PUT /api/issues/:id - Update issue
  static async updateIssue(issueData: UpdateIssueRequest): Promise<ApiResponse<Issue>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/${issueData.id}`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  // DELETE /api/issues/:id - Delete issue
  static async deleteIssue(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/issues/${id}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        return {
          success: false,
          message: `HTTP error! status: ${response.status}`,
          data: undefined,
          statusCode: response.status,
          errors: [`Delete failed with status ${response.status}`]
        };
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If no content or empty response, return success
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        return {
          success: true,
          message: 'Issue deleted successfully',
          data: undefined,
          statusCode: response.status,
          errors: []
        };
      }

      // Try to parse JSON response if there is content
      const text = await response.text();
      if (!text) {
        return {
          success: true,
          message: 'Issue deleted successfully',
          data: undefined,
          statusCode: response.status,
          errors: []
        };
      }

      try {
        const data = JSON.parse(text);
        // If the parsed data doesn't have all required properties, add them
        return {
          success: data.success ?? true,
          message: data.message ?? 'Issue deleted successfully',
          data: data.data ?? undefined,
          statusCode: data.statusCode ?? response.status,
          errors: data.errors ?? []
        };
      } catch (parseError) {
        // If JSON parsing fails but HTTP status was ok, assume success
        console.warn('Delete successful but could not parse response:', text);
        return {
          success: true,
          message: 'Issue deleted successfully',
          data: undefined,
          statusCode: response.status,
          errors: []
        };
      }
      
    } catch (error) {
      console.error('Error deleting issue:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete issue',
        data: undefined,
        statusCode: 0, // Network error - no status code
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  // Alternative method name for consistency with getAllIssues
  static async getIssues(): Promise<ApiResponse<Issue[]>> {
    return this.getAllIssues();
  }
}