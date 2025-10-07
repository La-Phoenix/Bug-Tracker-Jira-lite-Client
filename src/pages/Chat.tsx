import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Users,
  Phone,
  Video,
  Info,
  MoreVertical,
  ArrowLeft,
  Hash,
  Bot,
  Pin,
  VolumeX,
  X,
  AlertCircle
} from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { ChatService } from '../services/ChatService';
import { ChatRoomList } from '../components/Chat/ChatRoomList';
import { Message } from '../components/Chat/Message';
import { MessageInput } from '../components/Chat/MessageInput';
import { ChatInfo } from '../components/Chat/ChatInfo';
import { CreateChatModal } from '../components/Chat/CreateChatModal';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, ChatRoom } from '../types/interface';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const selectedRoomRef = useRef<ChatRoom | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize component
  useEffect(() => {
    console.log("hey")
    const initialize = async () => {
      await loadChatRooms();
      await initializeSignalR();
    };
    
    initialize();
    checkMobileView();
    
    const handleResize = () => checkMobileView();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom && connection?.state === signalR.HubConnectionState.Connected) {
      loadMessages(selectedRoom.id);
      
      // Join the room via SignalR
      ChatService.joinRoom(selectedRoom.id).catch(console.error);
    }
    
    return () => {
      if (selectedRoom && connection?.state === signalR.HubConnectionState.Connected) {
        ChatService.leaveRoom(selectedRoom.id).catch(console.error);
      }
    };
  }, [selectedRoom, connection]);

  useEffect(() => {
    console.log("Messages changed:", messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if MainLayout sidebar is open (you'll need to get this from context or props)
  // For now, let's assume it's open on desktop
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);

  const checkMobileView = useCallback(() => {
    const mobile = window.innerWidth < 768;
    const desktop = window.innerWidth >= 1024;
    setIsMobileView(mobile);
    
    // Auto-manage main sidebar visibility based on screen size
    setIsMainSidebarOpen(desktop);
    
    // On mobile, close chat sidebar when room is selected
    if (mobile && selectedRoom) {
      setShowSidebar(false);
    } else if (!mobile) {
      setShowSidebar(true);
    }
  }, [selectedRoom]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const initializeSignalR = async () => {
    try {
      const conn = await ChatService.initializeConnection();
      
      // Wait for connection to be established
      if (conn.state !== signalR.HubConnectionState.Connected) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
          
          conn.onreconnected(() => {
            clearTimeout(timeout);
            resolve(void 0);
          });
          
          if (conn.state === signalR.HubConnectionState.Connected) {
            clearTimeout(timeout);
            resolve(void 0);
          }
        });
      }

      // Clear any existing handlers to prevent duplicates
      conn.off("MessageReceived");
      conn.off("MessageEdited");
      conn.off("MessageDeleted");
      conn.off("ParticipantAdded");
      conn.off("ParticipantRemoved");
      conn.off("RoomUpdated");
      conn.off("UserStartedTyping");
      conn.off("UserStoppedTyping");

      // Set up event handlers
      setupSignalRHandlers(conn);
      
      setConnection(conn);
      setLoading(false);
      scrollToBottom();
      setShowSidebar(false)
      
    } catch (error) {
      console.error("Failed to initialize SignalR:", error);
      setLoading(false);
    }
  };

  const setupSignalRHandlers = (conn: signalR.HubConnection) => {
    // Message received
    conn.on("MessageReceived", (data: { roomId: number; message: ChatMessage }) => {
      console.log("Message received via SignalR:", data);
      
      setMessages(prevMessages => {
        if (selectedRoomRef.current?.id === data.roomId) {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some(msg => msg.id === data.message.id);
          if (!exists) {
            return [...prevMessages, data.message];
          }
        }
        return prevMessages;
      });

      setRooms(prev => prev.map(room =>
        room.id === data.roomId
          ? {
              ...room,
              lastMessage: data.message,
              unreadCount: selectedRoomRef.current?.id === data.roomId ? 0 : room.unreadCount + 1
            }
          : room
      ));
    });

    // Message edited
    conn.on("MessageEdited", (data: { roomId: number; messageId: number; content: string; editedAt: string }) => {
      console.log("Message edited via SignalR:", data);
      
      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId 
          ? { ...msg, content: data.content, isEdited: true, updatedAt: data.editedAt } 
          : msg
      ));
    });

    // Message deleted
    conn.on("MessageDeleted", (data: { roomId: number; messageId: number; deletedBy: string; deletedAt: string }) => {
      console.log("Message deleted via SignalR:", data);
      
      // Only update if we're in the same room
      if (selectedRoomRef.current?.id === data.roomId) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { 
                ...msg, 
                isDeleted: true, 
                content: `Message deleted.`
              }
            : msg
        ));
      }
      
      // Update the last message in rooms list if this was the last message
      setRooms(prev => prev.map(room => 
        room.id === data.roomId && room.lastMessage?.id === data.messageId
          ? { 
              ...room, 
              lastMessage: { 
                ...room.lastMessage, 
                content: "Message deleted",
                isDeleted: true 
              } 
            }
          : room
      ));
    });

    // Typing events
    conn.on("UserStartedTyping", (data: { roomId: number; userName: string, userId: number }) => {
      if (selectedRoomRef.current?.id === data.roomId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      }
    });

    conn.on("UserStoppedTyping", (data: { roomId: number; userName: string, userId: number }) => {
      if (selectedRoomRef.current?.id === data.roomId) {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
      }
    });

    // Participant events
    conn.on("ParticipantAdded", (data: { roomId: number; participant: any }) => {
      console.log("Participant added via SignalR:", data);
      
      setRooms(prev => prev.map(room =>
        room.id === data.roomId 
          ? { ...room, participants: [...room.participants, data.participant] } 
          : room
      ));
    });

    conn.on("ParticipantRemoved", (data: { roomId: number; userId: number }) => {
      console.log("Participant removed via SignalR:", data);
      
      setRooms(prev => prev.map(room =>
        room.id === data.roomId
          ? { ...room, participants: room.participants.filter(p => p.userId !== data.userId) }
          : room
      ));
    });

    // Room updated
    conn.on("RoomUpdated", (data: { room: ChatRoom }) => {
      console.log("Room updated via SignalR:", data);
      
      setRooms(prev => prev.map(room => (room.id === data.room.id ? data.room : room)));
      if (selectedRoomRef.current?.id === data.room.id) {
        setSelectedRoom(data.room);
      }
    });

    // Connection events
    conn.onreconnected(() => {
      console.log("SignalR reconnected");
      if (selectedRoomRef.current) {
        ChatService.joinRoom(selectedRoomRef.current.id);
      }
    });

    conn.onclose(() => {
      console.log("SignalR connection closed");
      setConnection(null);
    });
  };

  useEffect(() => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;

    // Tell server which room we're in
    connection.invoke("JoinRoom", selectedRoom?.id);
  }, [selectedRoom, connection]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ChatService.getChatRooms();
      if (response.success && response.data) {
        setRooms(response.data);
        console.log("Room Fetch: ", response.data)
        
        // Auto-select first room on desktop if no room selected
        if (response.data.length > 0 && !selectedRoom && !isMobileView) {
          setSelectedRoom(response.data[0]);
        }
        console.log(rooms);
      } else {
        setError(response.message || 'Failed to load chat rooms');
      }
    } catch (err: any) {
      setError('An error occurred while loading chat rooms');
    }
  };

  const loadMessages = async (roomId: number) => {
    try {
      setMessagesLoading(true);
      
      const response = await ChatService.getChatMessages(roomId);
      if (response.success && response.data) {
        const sorted = response.data.messages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted || []);
        
        // Mark messages as read
        if (response.data.messages && response.data.messages.length > 0) {
          const lastMessage = response.data.messages[response.data.messages.length - 1];
          await ChatService.markAsRead(roomId, lastMessage.id);
          
          // Update unread count
          setRooms(prev => prev.map(room => 
            room.id === roomId ? { ...room, unreadCount: 0 } : room
          ));
        }
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'file' | 'voice') => {
    if (!selectedRoom || !content.trim()) return;

    console.log("Selected Room", selectedRoom);
    console.log("Content: ", content);
    console.log("Reply To: ", replyTo);

    try {
      const response = await ChatService.sendMessage({
        roomId: selectedRoom.id,
        content: content.trim(),
        type,
        replyToId: replyTo?.id
      });

      if (response.success && response.data) {
        // Message will be added via SignalR
        setReplyTo(null);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    }
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p.userId !== user?.id);
      console.log("room:", room)
      console.log("otherParticipant:", otherParticipant)
      return otherParticipant?.userName || 'Unknown User';
    }
    return room.name;
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      const response = await ChatService.editMessage(messageId, newContent);
      if (response.success) {
        // Message will be updated via SignalR
      }
    } catch (err: any) {
      console.error('Error editing message:', err);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedRoom) return false;

    const message = messages.find(msg => msg.id === messageId);
    if (!message) return false;
    
    // Check if message is too old to delete (e.g., 24 hours)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxDeleteTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (messageAge > maxDeleteTime && message.senderId !== user?.id) {
      setError('This message is too old to be deleted.');
      return false;
    }
    
    // Check if user can delete this message
    if (message.senderId !== user?.id) {
      // Only allow if user is admin/owner of the room
      const userParticipant = selectedRoom.participants.find(p => p.userId === user?.id);
      if (!userParticipant || userParticipant.role !== 'admin') {
        setError('You can only delete your own messages.');
        return false;
      }
    }

    try {
      const response = await ChatService.deleteMessage(messageId, selectedRoom?.id);
      if (response.success) {
        // Message will be removed via SignalR
        return true;
      }
    } catch (err: any) {
      console.error('Error deleting message:', err);
    }
    return false;
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setReplyTo(null);
    setTypingUsers([]);
    
    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    if (isMobileView) {
      setSelectedRoom(null);
      setShowSidebar(true);
    }
  };

  const toggleMute = async (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const response = await ChatService.toggleMute(roomId, !room.isMuted);
      if (response.success) {
        setRooms(prev => prev.map(r => 
          r.id === roomId ? { ...r, isMuted: !r.isMuted } : r
        ));
      }
    }
  };

  const togglePin = async (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const response = await ChatService.togglePin(roomId, !room.isPinned);
      if (response.success) {
        setRooms(prev => prev.map(r => 
          r.id === roomId ? { ...r, isPinned: !r.isPinned } : r
        ));
      }
    }
  };

  const handleTyping = useCallback(() => {
    if (selectedRoom && connection) {
      ChatService.startTyping(selectedRoom.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        ChatService.stopTyping(selectedRoom.id);
      }, 2000);
    }
  }, [selectedRoom, connection]);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.participants.some(p => 
        p.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'unread':
        return room.unreadCount > 0;
      case 'pinned':
        return room.isPinned;
      default:
        return true;
    }
  });

  const getRoomTypeIcon = (room: ChatRoom) => {
    switch (room.type) {
      case 'direct':
        return <Users className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'project':
        return <Hash className="h-4 w-4" />;
      case 'ai_assistant':
        return <Bot className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRoomTypeLabel = (type: ChatRoom['type']) => {
    switch (type) {
      case 'direct':
        return 'Direct Message';
      case 'group':
        return 'Group Chat';
      case 'project':
        return 'Project Chat';
      case 'ai_assistant':
        return 'AI Assistant';
      default:
        return 'Chat';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Error Display - Adjusted for MainLayout sidebar and mobile header toggle */}
      {error && (
        <div className={`fixed z-50 mx-4 max-w-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 ${
          isMainSidebarOpen && !isMobileView 
            ? 'top-4 left-80 transform-none' 
            : isMobileView 
            ? 'top-16 left-1/2 transform -translate-x-1/2' // Account for mobile header toggle button
            : 'top-4 left-1/2 transform -translate-x-1/2'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Chat Sidebar - Adjusted for MainLayout */}
      <div className={`
        ${isMobileView 
          ? `fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`
          : `w-80 flex-shrink-0 ${isMainSidebarOpen ? 'ml-0' : 'ml-0'}`
        } 
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full
      `}>
        
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Chat
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="New chat"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              {isMobileView && (
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={isMobileView ? "Search..." : "Search conversations..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {['all', 'unread', 'pinned'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as typeof activeFilter)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeFilter === filter
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {filteredRooms.length === 0 ? (
            <div className="text-center p-6">
              <div className="text-gray-400 mb-2">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No conversations found</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Start a new conversation'}
              </p>
            </div>
          ) : (
            <ChatRoomList
              rooms={filteredRooms}
              selectedRoomId={selectedRoom?.id}
              onRoomSelect={handleRoomSelect}
              onToggleMute={toggleMute}
              onTogglePin={togglePin}
              loading={false}
              currentUserId={user!.id}
            />
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileView && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat Header - Sticky */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {isMobileView && (
                  <button
                    onClick={handleBackToSidebar}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
                
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                  {selectedRoom.avatar ? (
                    <img src={selectedRoom.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getRoomDisplayName(selectedRoom).charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {getRoomDisplayName(selectedRoom) || "Unknown User"}
                    </h2>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="hidden xs:block">
                        {getRoomTypeIcon(selectedRoom)}
                      </div>
                      {selectedRoom.isPinned && <Pin className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                      {selectedRoom.isMuted && <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="hidden sm:inline">{getRoomTypeLabel(selectedRoom.type)}</span>
                    {selectedRoom.type !== 'direct' && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{selectedRoom.participants.length} member{selectedRoom.participants.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                    {selectedRoom.participants.some(p => p.isOnline) && (
                      <>
                        <span>•</span>
                        <span className="text-green-500">Online</span>
                      </>
                    )}
                  </div>
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="text-xs text-blue-500 italic animate-pulse truncate">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.length} people typing...`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                {selectedRoom.type !== 'ai_assistant' && !isMobileView && (
                  <>
                    <button 
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Voice call"
                    >
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Video call"
                    >
                      <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setShowChatInfo(!showChatInfo)}
                  className={`p-1.5 sm:p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    showChatInfo 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="Chat info"
                >
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                <button 
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <div className="h-full overflow-y-auto custom-scrollbar px-2 sm:px-4 pt-4 space-y-1 sm:space-y-2 pb-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center max-w-xs sm:max-w-md">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        {getRoomTypeIcon(selectedRoom)}
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Start the conversation
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                        {selectedRoom.type === 'ai_assistant'
                          ? 'Ask me anything about your project...'
                          : 'Send your first message to get the conversation started.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        message={message}
                        currentUserId={user?.id || 0}
                        onReply={setReplyTo}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                replyTo={replyTo ? {
                  id: replyTo.id,
                  content: replyTo.content,
                  senderName: replyTo.senderName
                } : undefined}
                onCancelReply={() => setReplyTo(null)}
                placeholder={
                  selectedRoom.type === 'ai_assistant' 
                    ? 'Ask me anything...'
                    : 'Type a message...'
                }
              />
            </div>
          </>
        ) : (
          /* No Room Selected */
          <div className="h-full flex items-center justify-center p-4 sm:p-8">
            {isMobileView ? (
              <div className="text-center max-w-xs">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to Chat
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
                  Select a conversation to start chatting with your team.
                </p>
                <button
                  onClick={() => setShowSidebar(true)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  View Conversations
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed text-sm sm:text-base">
                  Choose a chat room from the sidebar to start messaging with your team, 
                  or create a new conversation to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Info & Modals - keep existing */}
      {showChatInfo && selectedRoom && !isMobileView && (
        <div className="w-80 flex-shrink-0">
          <ChatInfo
            room={selectedRoom}
            onClose={() => setShowChatInfo(false)}
            onToggleMute={() => toggleMute(selectedRoom.id)}
            onTogglePin={() => togglePin(selectedRoom.id)}
          />
        </div>
      )}

      {showChatInfo && selectedRoom && isMobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white dark:bg-gray-800 w-full h-[85vh] sm:h-[90vh] rounded-t-2xl">
            <ChatInfo
              room={selectedRoom}
              onClose={() => setShowChatInfo(false)}
              onToggleMute={() => toggleMute(selectedRoom.id)}
              onTogglePin={() => togglePin(selectedRoom.id)}
            />
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateChatModal
          onClose={() => setShowCreateModal(false)}
          onChatCreated={(newRoom) => {
            setRooms(prev => [newRoom, ...prev]);
            setSelectedRoom(newRoom);
            setShowCreateModal(false);
            if (isMobileView) {
              setShowSidebar(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default Chat;