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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  }

  // Alternative method name for consistency with getAllIssues
  static async getIssues(): Promise<ApiResponse<Issue[]>> {
    return this.getAllIssues();
  }
}