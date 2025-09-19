import type { ApiResponse } from '../types/interface';
import type { AdminStats, SystemActivity, UserActivity, ProjectActivity, SystemHealth } from '../types/interface';

export class AdminService {
  static async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      // Mock implementation - replace with actual API call
      const mockStats: AdminStats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalProjects: 156,
        activeProjects: 89,
        totalIssues: 3421,
        resolvedIssues: 2156,
        systemHealth: 98,
        storageUsed: 78.5,
        storageLimit: 100
      };

      return { 
        success: true, 
        data: mockStats,
        statusCode: 200,
        message: 'Admin stats fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch admin stats',
        statusCode: 500,
        data: {} as AdminStats,
        errors: []
      };
    }
  }

  static async getSystemActivity(): Promise<ApiResponse<SystemActivity[]>> {
    try {
      const mockActivity: SystemActivity[] = [
        {
          id: 1,
          type: 'user_registered',
          description: 'New user registration',
          userId: 123,
          userName: 'John Doe',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          type: 'project_created',
          description: 'Project "Mobile App Redesign" created',
          userId: 45,
          userName: 'Jane Smith',
          timestamp: '2024-01-15T09:15:00Z'
        },
        {
          id: 3,
          type: 'system_event',
          description: 'Database backup completed successfully',
          timestamp: '2024-01-15T02:00:00Z'
        }
      ];

      return { 
        success: true, 
        data: mockActivity,
        statusCode: 200,
        message: 'System activity fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch system activity',
        statusCode: 500,
        data: [] as SystemActivity[],
        errors: []
      };
    }
  }

  static async getUserActivity(): Promise<ApiResponse<UserActivity[]>> {
    try {
      const mockUserActivity: UserActivity[] = [
        {
          userId: 1,
          userName: 'John Doe',
          userEmail: 'john@example.com',
          lastLogin: '2024-01-15T08:30:00Z',
          issuesCreated: 45,
          issuesResolved: 38,
          projectsCount: 3,
          status: 'active'
        }
      ];

      return { 
        success: true, 
        data: mockUserActivity,
        statusCode: 200,
        message: 'User activity fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch user activity',
        statusCode: 500,
        data: [] as UserActivity[],
        errors: []
      };
    }
  }

  static async getProjectActivity(): Promise<ApiResponse<ProjectActivity[]>> {
    try {
      const mockProjectActivity: ProjectActivity[] = [
        {
          projectId: 1,
          projectName: 'Bug Tracker System',
          createdBy: 'Admin User',
          membersCount: 12,
          issuesCount: 156,
          completionRate: 78,
          lastActivity: '2024-01-15T14:20:00Z',
          status: 'active'
        }
      ];

      return { 
        success: true, 
        data: mockProjectActivity,
        statusCode: 200,
        message: 'Project activity fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch project activity',
        statusCode: 500,
        data: [] as ProjectActivity[],
        errors: []
      };
    }
  }

  static async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    try {
      const mockHealth: SystemHealth = {
        cpu: 45,
        memory: 68,
        storage: 78,
        database: 92,
        apiResponseTime: 125,
        uptime: '15 days, 4 hours',
        lastChecked: new Date().toISOString()
      };

      return { 
        success: true, 
        data: mockHealth,
        statusCode: 200,
        message: 'System health fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch system health',
        statusCode: 500,
        data: {} as SystemHealth,
        errors: []
      };
    }
  }

  static async suspendUser(userId: number): Promise<ApiResponse<void>> {
    try {
      console.log('Suspending user:', userId);
      return { 
        success: true,
        statusCode: 200,
        message: 'User suspended successfully',
        data: undefined,
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to suspend user',
        statusCode: 500,
        data: undefined,
        errors: []
      };
    }
  }

  static async deleteProject(projectId: number): Promise<ApiResponse<void>> {
    try {
      console.log('Deleting project:', projectId);
      return { 
        success: true,
        statusCode: 200,
        message: 'Project deleted successfully',
        data: undefined,
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to delete project',
        statusCode: 500,
        data: undefined,
        errors: []
      };
    }
  }

  static async performBackup(): Promise<ApiResponse<void>> {
    try {
      console.log('Performing system backup');
      return { 
        success: true,
        statusCode: 200,
        message: 'Backup completed successfully',
        data: undefined,
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to perform backup',
        statusCode: 500,
        data: undefined,
        errors: []
      };
    }
  }
}