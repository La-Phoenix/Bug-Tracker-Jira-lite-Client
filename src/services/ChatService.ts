import type { ApiResponse } from '../types/interface';
import type { ChatRoom, ChatMessage, CreateChatRoomRequest, SendMessageRequest } from '../types/chat';

export class ChatService {
  private static baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Chat Rooms
  static async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    try {
      // Mock implementation - replace with actual API call
      const mockRooms: ChatRoom[] = [
        {
          id: 1,
          name: 'General Discussion',
          type: 'group',
          description: 'General team discussions',
          participants: [
            { userId: 1, userName: 'John Doe', userEmail: 'john@example.com', role: 'Admin', isOnline: true },
            { userId: 2, userName: 'Jane Smith', userEmail: 'jane@example.com', role: 'Member', isOnline: false, lastSeen: '2024-01-15T10:30:00Z' }
          ],
          unreadCount: 3,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          lastMessage: {
            id: 1,
            roomId: 1,
            senderId: 2,
            senderName: 'Jane Smith',
            content: 'Great work on the latest update!',
            type: 'text',
            isEdited: false,
            createdAt: '2024-01-15T14:30:00Z',
            updatedAt: '2024-01-15T14:30:00Z'
          }
        }
      ];

      return { success: true, data: mockRooms };
    } catch (error) {
      return { success: false, message: 'Failed to fetch chat rooms' };
    }
  }

  static async createChatRoom(request: CreateChatRoomRequest): Promise<ApiResponse<ChatRoom>> {
    try {
      // Mock implementation
      console.log('Creating chat room:', request);
      return { success: true, data: {} as ChatRoom };
    } catch (error) {
      return { success: false, message: 'Failed to create chat room' };
    }
  }

  static async getChatMessages(roomId: number, page = 1, limit = 50): Promise<ApiResponse<ChatMessage[]>> {
    try {
      // Mock implementation
      const mockMessages: ChatMessage[] = [
        {
          id: 1,
          roomId,
          senderId: 1,
          senderName: 'John Doe',
          content: 'Hello everyone! Let\'s discuss the upcoming sprint.',
          type: 'text',
          isEdited: false,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        },
        {
          id: 2,
          roomId,
          senderId: 2,
          senderName: 'Jane Smith',
          content: 'Great work on the latest update!',
          type: 'text',
          isEdited: false,
          createdAt: '2024-01-15T14:30:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        }
      ];

      return { success: true, data: mockMessages };
    } catch (error) {
      return { success: false, message: 'Failed to fetch messages' };
    }
  }

  static async sendMessage(request: SendMessageRequest): Promise<ApiResponse<ChatMessage>> {
    try {
      // Mock implementation
      console.log('Sending message:', request);
      const mockMessage: ChatMessage = {
        id: Date.now(),
        roomId: request.roomId,
        senderId: 1, // Current user ID
        senderName: 'Current User',
        content: request.content,
        type: request.type,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { success: true, data: mockMessage };
    } catch (error) {
      return { success: false, message: 'Failed to send message' };
    }
  }

  static async markAsRead(roomId: number): Promise<ApiResponse<void>> {
    try {
      console.log('Marking room as read:', roomId);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to mark as read' };
    }
  }
}