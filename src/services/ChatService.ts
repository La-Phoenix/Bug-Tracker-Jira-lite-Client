import type { ApiResponse } from '../types/interface';
import type { ChatRoom, ChatMessage, CreateChatRoomRequest, SendMessageRequest } from '../types/interface';

export class ChatService {
  // private static baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Get chat rooms with different types
  static async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    try {
      const mockRooms: ChatRoom[] = [
        {
          id: 1,
          name: 'AI Assistant',
          type: 'ai_assistant',
          description: 'Get help with your projects and tasks',
          participants: [
            { 
              userId: 999, 
              userName: 'AI Assistant', 
              userEmail: 'ai@bugtrackr.com', 
              avatar: '', 
              role: 'admin', 
              isOnline: true,
              status: 'available'
            }
          ],
          unreadCount: 0,
          isPinned: true,
          isMuted: false,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          name: 'Project Team',
          type: 'group',
          description: 'Main project discussion',
          participants: [
            { userId: 1, userName: 'John Doe', userEmail: 'john@example.com', role: 'admin', isOnline: true, status: 'available' },
            { userId: 2, userName: 'Jane Smith', userEmail: 'jane@example.com', role: 'member', isOnline: false, lastSeen: '2024-01-15T10:30:00Z', status: 'away' },
            { userId: 3, userName: 'Mike Wilson', userEmail: 'mike@example.com', role: 'member', isOnline: true, status: 'busy' }
          ],
          unreadCount: 3,
          isPinned: false,
          isMuted: false,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          lastMessage: {
            id: 1,
            roomId: 2,
            senderId: 2,
            senderName: 'Jane Smith',
            content: 'Great work on the latest update!',
            type: 'text',
            isEdited: false,
            createdAt: '2024-01-15T14:30:00Z',
            updatedAt: '2024-01-15T14:30:00Z'
          }
        },
        {
          id: 3,
          name: 'Sarah Johnson',
          type: 'direct',
          participants: [
            { userId: 4, userName: 'Sarah Johnson', userEmail: 'sarah@example.com', role: 'member', isOnline: true, status: 'available' }
          ],
          unreadCount: 1,
          isPinned: false,
          isMuted: false,
          createdAt: '2024-01-12T09:00:00Z',
          updatedAt: '2024-01-15T16:00:00Z',
          lastMessage: {
            id: 2,
            roomId: 3,
            senderId: 4,
            senderName: 'Sarah Johnson',
            content: 'Can we schedule a meeting tomorrow?',
            type: 'text',
            isEdited: false,
            createdAt: '2024-01-15T16:00:00Z',
            updatedAt: '2024-01-15T16:00:00Z'
          }
        },
        {
          id: 4,
          name: 'BugTracker Pro Development',
          type: 'project',
          description: 'Development discussions for BugTracker Pro',
          projectId: 1,
          participants: [
            { userId: 1, userName: 'John Doe', userEmail: 'john@example.com', role: 'admin', isOnline: true, status: 'available' },
            { userId: 5, userName: 'Alex Chen', userEmail: 'alex@example.com', role: 'member', isOnline: false, status: 'invisible' }
          ],
          unreadCount: 0,
          isPinned: false,
          isMuted: true,
          createdAt: '2024-01-08T09:00:00Z',
          updatedAt: '2024-01-14T11:20:00Z'
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
      console.log('Creating chat room:', request);
      const mockRoom: ChatRoom = {
        id: Date.now(),
        name: request.name,
        type: request.type,
        description: request.description,
        projectId: request.projectId,
        participants: [],
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
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
      // Mock messages based on room type
      let mockMessages: ChatMessage[] = [];
      
      if (roomId === 1) { // AI Assistant
        mockMessages = [
          {
            id: 1,
            roomId,
            senderId: 999,
            senderName: 'AI Assistant',
            content: 'Hello! I\'m your AI assistant. I can help you with:\n\n• Analyzing bug reports\n• Suggesting priorities\n• Finding similar issues\n• Project insights\n\nWhat would you like help with today?',
            type: 'text',
            isEdited: false,
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z'
          }
        ];
      } else {
        mockMessages = [
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
      }

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

  static async toggleMute(roomId: number, mute: boolean): Promise<ApiResponse<void>> {
    try {
      console.log(`${mute ? 'Muting' : 'Unmuting'} room:`, roomId);
      return { 
        success: true,
        statusCode: 200,
        message: `Room ${mute ? 'muted' : 'unmuted'} successfully`,
        data: undefined,
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to ${mute ? 'mute' : 'unmute'} room`,
        statusCode: 500,
        data: undefined,
        errors: []
      };
    }
  }

  static async togglePin(roomId: number, pin: boolean): Promise<ApiResponse<void>> {
    try {
      console.log(`${pin ? 'Pinning' : 'Unpinning'} room:`, roomId);
      return { 
        success: true,
        statusCode: 200,
        message: `Room ${pin ? 'pinned' : 'unpinned'} successfully`,
        data: undefined,
        errors: []
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to ${pin ? 'pin' : 'unpin'} room`,
        statusCode: 500,
        data: undefined,
        errors: []
      };
    }
  }
}