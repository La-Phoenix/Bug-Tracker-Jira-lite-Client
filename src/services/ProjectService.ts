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
}