import type { ApiResponse } from '../types/interface';
import type { ChatRoom, ChatMessage, CreateChatRoomRequest, SendMessageRequest } from '../types/interface';

export class ChatService {
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

      return { 
        success: true, 
        data: mockRooms,
        statusCode: 200,
        message: 'Chat rooms fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch chat rooms',
        statusCode: 500,
        data: [] as ChatRoom[],
        errors: []
      };
    }
  }

  static async createChatRoom(request: CreateChatRoomRequest): Promise<ApiResponse<ChatRoom>> {
    try {
      // Mock implementation
      console.log('Creating chat room:', request);
      const mockRoom: ChatRoom = {
        id: Date.now(),
        name: request.name,
        type: request.type,
        description: request.description,
        projectId: request.projectId,
        participants: [],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return { 
        success: true, 
        data: mockRoom,
        statusCode: 201,
        message: 'Chat room created successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to create chat room',
        statusCode: 500,
        data: {} as ChatRoom,
        errors: []
      };
    }
  }

  static async getChatMessages(roomId: number): Promise<ApiResponse<ChatMessage[]>> {
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

      return { 
        success: true, 
        data: mockMessages,
        statusCode: 200,
        message: 'Messages fetched successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to fetch messages',
        statusCode: 500,
        data: [] as ChatMessage[],
        errors: []
      };
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
      
      return { 
        success: true, 
        data: mockMessage,
        statusCode: 201,
        message: 'Message sent successfully',
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to send message',
        statusCode: 500,
        data: {} as ChatMessage,
        errors: []
      };
    }
  }

  static async markAsRead(roomId: number): Promise<ApiResponse<void>> {
    try {
      console.log('Marking room as read:', roomId);
      return { 
        success: true,
        statusCode: 200,
        message: 'Marked as read successfully',
        data: undefined,
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to mark as read',
        statusCode: 500,
        data: undefined,
        errors: []
      };
    }
  }
}