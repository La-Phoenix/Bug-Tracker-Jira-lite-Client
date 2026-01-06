import * as signalR from '@microsoft/signalr';
import type { 
  Notification,
  ApiResponse
} from '../types/interface';

export class NotificationService {
  private static baseUrl = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8080/api';
  private static notificationConnection: signalR.HubConnection | null = null;
  private static isConnecting: boolean = false;
  private static connectionPromise: Promise<signalR.HubConnection> | null = null;

  // Initialize SignalR notification connection
  static async initializeNotificationConnection(): Promise<signalR.HubConnection> {
    // If already connected, return existing connection
    if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
      return this.notificationConnection;
    }

    // If already connecting, wait for that connection
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // If connection exists but is disconnected, clean it up first
    if (this.notificationConnection) {
      try {
        await this.notificationConnection.stop();
      } catch (error) {
        console.warn('Error stopping existing connection:', error);
      }
      this.notificationConnection = null;
    }

    this.isConnecting = true;

    this.connectionPromise = this.createConnection();
    
    try {
      const connection = await this.connectionPromise;
      this.isConnecting = false;
      return connection;
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  private static async createConnection(): Promise<signalR.HubConnection> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl.replace('/api', '')}/notificationHub`, {
        accessTokenFactory: () => {
          // Get fresh token each time
          return localStorage.getItem('token') || '';
        },
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up connection event handlers
    connection.onreconnecting(() => {
      console.log('SignalR notification connection reconnecting...');
    });

    connection.onreconnected(() => {
      console.log('SignalR notification connection reconnected');
    });

    connection.onclose((error) => {
      console.log('SignalR notification connection closed', error);
      // Reset connection state
      if (this.notificationConnection === connection) {
        this.notificationConnection = null;
        this.isConnecting = false;
        this.connectionPromise = null;
      }
    });

    try {
      await connection.start();
      console.log('SignalR notification connection established');
      this.notificationConnection = connection;
      return connection;
    } catch (error) {
      console.error('Error establishing SignalR notification connection:', error);
      // Clean up failed connection
      try {
        await connection.stop();
      } catch (stopError) {
        console.warn('Error stopping failed connection:', stopError);
      }
      throw error;
    }
  }

  static getNotificationConnection(): signalR.HubConnection | null {
    return this.notificationConnection;
  }

  static async disconnectNotifications(): Promise<void> {
    this.isConnecting = false;
    this.connectionPromise = null;
    
    if (this.notificationConnection) {
      try {
        await this.notificationConnection.stop();
      } catch (error) {
        console.warn('Error stopping notification connection:', error);
      }
      this.notificationConnection = null;
    }
  }

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Notification API request failed:', error);
      return { 
        success: false, 
        statusCode: 500,
        message: 'Network error occurred',
        data: undefined,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      } as ApiResponse<T>;
    }
  }

  // REST API methods
  static async getNotifications(
    unreadOnly = false, 
    page = 1, 
    limit = 50
  ): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams({
      unreadOnly: unreadOnly.toString(),
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.makeRequest<Notification[]>(`/notifications?${params}`);
  }

  static async markAsRead(notificationId: number): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  static async markAllAsRead(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  static async deleteNotification(notificationId: number): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  static async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.makeRequest<{ count: number }>('/notifications/unread-count');
  }

  // SignalR helper methods
  static async markNotificationAsReadViaSignalR(notificationId: number): Promise<void> {
    if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.notificationConnection.invoke('MarkAsRead', notificationId.toString());
      } catch (error) {
        console.error('Failed to mark notification as read via SignalR:', error);
      }
    }
  }

  // Event listeners
  static onNotificationReceived(callback: (notification: Notification) => void): void {
    if (this.notificationConnection) {
        console.log("ReceiveNotification")
        this.notificationConnection.on('ReceiveNotification', callback);
    }
  }

  static onNotificationRead(callback: (notificationId: number) => void): void {
    if (this.notificationConnection) {
      this.notificationConnection.on('NotificationRead', callback);
    }
  }

  static onNotificationDeleted(callback: (notificationId: number) => void): void {
    if (this.notificationConnection) {
      this.notificationConnection.on('NotificationDeleted', callback);
    }
  }

  // Remove event listeners
  static offNotificationReceived(): void {
    if (this.notificationConnection) {
      this.notificationConnection.off('ReceiveNotification');
    }
  }

  static offNotificationRead(): void {
    if (this.notificationConnection) {
      this.notificationConnection.off('NotificationRead');
    }
  }

  static offNotificationDeleted(): void {
    if (this.notificationConnection) {
      this.notificationConnection.off('NotificationDeleted');
    }
  }

  // Check connection status
  static isConnected(): boolean {
    return this.notificationConnection?.state === signalR.HubConnectionState.Connected;
  }

  static getConnectionState(): signalR.HubConnectionState | null {
    return this.notificationConnection?.state || null;
  }
}