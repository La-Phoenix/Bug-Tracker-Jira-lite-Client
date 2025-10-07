import * as signalR from '@microsoft/signalr';
import type { 
  ChatRoom, 
  ChatMessage, 
  CreateChatRoomRequest,
  SendMessageRequest,
  ApiResponse,
  ChatParticipant
} from '../types/interface';

export class ChatService {
  private static baseUrl = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8080/api';
  private static connection: signalR.HubConnection | null = null;

  // Initialize SignalR connection
  static async initializeConnection(): Promise<signalR.HubConnection> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.connection?.state === signalR.HubConnectionState.Connecting || 
        this.connection?.state === signalR.HubConnectionState.Reconnecting) {
      // Wait for existing connection attempt to complete
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        
        const checkState = () => {
          if (this.connection?.state === signalR.HubConnectionState.Connected) {
            clearTimeout(timeout);
            resolve(this.connection);
          } else if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkState, 100);
          }
        };
        
        checkState();
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl.replace('/api', '')}/chatHub`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connection established');
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      this.connection = null;
      throw error;
    }

    return this.connection;
  }

  static getConnection(): signalR.HubConnection | null {
    return this.connection;
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
      console.error('API request failed:', error);
      return { 
        success: false, 
        statusCode: 500,
        message: 'Network error occurred',
        data: undefined,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      } as ApiResponse<T>;
    }
  }

  static async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    return this.makeRequest<ChatRoom[]>('/chat/rooms');
  }

  static async createChatRoom(request: CreateChatRoomRequest): Promise<ApiResponse<ChatRoom>> {
    return this.makeRequest<ChatRoom>('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async getChatMessages(
    roomId: number, 
    page = 1, 
    limit = 50
  ): Promise<ApiResponse<{ messages: ChatMessage[]; pagination: any }>> {
    return this.makeRequest<{ messages: ChatMessage[]; pagination: any }>(
      `/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`
    );
  }

  static async sendMessage(request: SendMessageRequest & { roomId: number }): Promise<ApiResponse<ChatMessage>> {
    const { roomId, ...body } = request;
    return this.makeRequest<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  static async addParticipantsToRoom(roomId: number, userIds: number[], requesterId: number): Promise<ApiResponse<ChatParticipant[]>> {
    return this.makeRequest<ChatParticipant[]>(`rooms/${roomId}/participants`, {
      method: 'POST',
      body: JSON.stringify({
        userIds,
        requesterId,
      }),
    });
  }
  static async removeParticipantFromRoom(roomId: number, participantUserId: number): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`rooms/${roomId}/participants/${participantUserId}`, {
      method: 'DELETE',
    });
  }

  //Not available endpoint yet
  // static async leaveRoom(roomId: number, userId: number): Promise<ApiResponse<void>> {
  //   return this.makeRequest<ChatMessage>(`rooms/{roomId:int}/participants/{participantUserId:int}`, {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       userIds: [userId]
  //     }),
  //   });
  // }

  static async editMessage(messageId: number, content: string): Promise<ApiResponse<ChatMessage>> {
    return this.makeRequest<ChatMessage>(`/chat/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  static async deleteMessage(messageId: number, roomId: number ): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/chat/messages/${messageId}`, {
      method: 'DELETE',
      body: JSON.stringify({roomId})
    });
  }

  static async togglePin(roomId: number, isPinned: boolean): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/chat/rooms/${roomId}/pin`, {
      method: 'PUT',
      body: JSON.stringify({ isPinned }),
    });
  }

  static async toggleMute(roomId: number, isMuted: boolean): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/chat/rooms/${roomId}/mute`, {
      method: 'PUT',
      body: JSON.stringify({ isMuted }),
    });
  }

  static async markAsRead(roomId: number, lastMessageId?: number): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/chat/messages/${lastMessageId || 0}/read`, {
      method: 'POST',
      body: JSON.stringify({ roomId, lastMessageId }),
    });
  }

  static async searchMessages(params: {
    query: string;
    roomId?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.makeRequest<any>(`/chat/search?${queryParams}`);
  }

  // SignalR helper methods
  static async joinRoom(roomId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinRoom', roomId);
    }
  }

  static async leaveRoom(roomId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveRoom', roomId);
    }
  }

  static async startTyping(roomId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('StartTyping', roomId);
    }
  }

  static async stopTyping(roomId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('StopTyping', roomId);
    }
  }
}