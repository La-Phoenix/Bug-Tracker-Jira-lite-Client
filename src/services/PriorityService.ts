import type { ApiResponse, Priority } from "../types/interface";
import { API_SERVER_BASE_URL } from "../utils/constants";
import { AuthService } from "./authService";


export class PriorityService {
  private static handleAuthError() {
    AuthService.logout();
    window.location.href = '/auth';
  }

  static async getAllPriorities(): Promise<ApiResponse<Priority[]>> {
    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/priorities`, {
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
      console.error('Error fetching priorities:', error);
      throw error;
    }
  }
}