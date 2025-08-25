import type { ApiResponse, Project } from "../types/interface";
import { API_SERVER_BASE_URL } from "../utils/constants";
import { AuthService } from "./authService";

export class ProjectService {
  private static handleAuthError() {
    AuthService.logout();
    window.location.href = '/auth';
  }

  static async getAllProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/projects`, {
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
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Add this method to ProjectService
  static async getMyProjects(userId?: number): Promise<ApiResponse<Project[]>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/projects/my-projects/${userId? userId : ""}`, {
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
      return data;
      
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch projects',
        data: [],
        statusCode: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }


  // Add this method to ProjectService
  static async addProjectMembers(projectId: number, userId: number, roleInProject: "Member" | "Admin"): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/projects/${projectId}/members/`, {
        method: 'POST',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, projectId, roleInProject }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error adding project members:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add members to project',
        data: null,
        statusCode: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Also add method to get users in a project
  static async getAvailableUsersForProject(projectId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/projects/${projectId}/members`, {
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
      return data;
      
    } catch (error) {
      console.error('Error fetching available users:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch available users',
        data: [],
        statusCode: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  static async removeProjectMember(projectId: number, userId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle empty response or JSON response
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        return {
          success: true,
          message: 'Member removed from project successfully',
          data: null,
          statusCode: response.status,
          errors: []
        };
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error removing project member:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove member from project',
        data: null,
        statusCode: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
      
}