import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  Hash,
  Bot,
  Pin,
  VolumeX,
} from 'lucide-react';
import { ChatService } from '../services/ChatService';
import { ChatRoomList } from '../components/Chat/ChatRoomList';
import { Message } from '../components/Chat/Message';
import { MessageInput } from '../components/Chat/MessageInput';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, ChatRoom } from '../types/interface';
import { ChatInfo } from '../components/Chat/ChatInfo';
import { CreateChatModal } from '../components/Chat/CreateChatModal';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatRooms();
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  console.log(setTypingUsers)

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkMobileView = () => {
    const mobile = window.innerWidth < 1024;
    setIsMobileView(mobile);
    if (!mobile) {
      setShowSidebar(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ChatService.getChatRooms();
      if (response.success && response.data) {
        setRooms(response.data);
        // Auto-select first room if available and not mobile
        if (response.data.length > 0 && !selectedRoom && !isMobileView) {
          setSelectedRoom(response.data[0]);
        }
      } else {
        setError(response.message || 'Failed to load chat rooms');
      }
    } catch (err: any) {
      setError('An error occurred while loading chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: number) => {
    try {
      setMessagesLoading(true);
      
      const response = await ChatService.getChatMessages(roomId);
      if (response.success && response.data) {
        setMessages(response.data);
        // Mark room as read
        await ChatService.markAsRead(roomId);
        // Update unread count in rooms list
        setRooms(prev => prev.map(room => 
          room.id === roomId ? { ...room, unreadCount: 0 } : room
        ));
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'file' | 'voice') => {
    if (!selectedRoom) return;

    try {
      const response = await ChatService.sendMessage({
        roomId: selectedRoom.id,
        content,
        type,
        replyTo: replyTo?.id
      });

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setReplyTo(null);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    }
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setReplyTo(null);
    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setSelectedRoom(null);
    setShowSidebar(true);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${
        isMobileView 
          ? `fixed inset-y-0 left-0 z-50 w-full sm:w-80 transform transition-transform duration-300 ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-80'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Chat
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="New chat"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors lg:hidden"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveFilter('pinned')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilter === 'pinned'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Pinned
            </button>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="text-center p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={loadChatRooms}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : (
            <ChatRoomList
              rooms={filteredRooms}
              selectedRoomId={selectedRoom?.id}
              onRoomSelect={handleRoomSelect}
              onToggleMute={toggleMute}
              onTogglePin={togglePin}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileView && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isMobileView && (
                  <button
                    onClick={handleBackToSidebar}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {selectedRoom.avatar ? (
                    <img src={selectedRoom.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedRoom.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {selectedRoom.name}
                    </h2>
                    {getRoomTypeIcon(selectedRoom)}
                    {selectedRoom.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                    {selectedRoom.isMuted && <VolumeX className="h-4 w-4 text-gray-400" />}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{getRoomTypeLabel(selectedRoom.type)}</span>
                    {selectedRoom.type !== 'direct' && (
                      <>
                        <span>•</span>
                        <span>{selectedRoom.participants.length} members</span>
                      </>
                    )}
                    {selectedRoom.participants.some(p => p.isOnline) && (
                      <>
                        <span>•</span>
                        <span className="text-green-500">Active now</span>
                      </>
                    )}
                  </div>
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="text-xs text-blue-500 italic">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.length} people are typing...`
                      }
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {selectedRoom.type !== 'ai_assistant' && (
                  <>
                    <button 
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Voice call"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Video call"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setShowChatInfo(!showChatInfo)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Chat info"
                >
                  <Info className="h-5 w-5" />
                </button>
                
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="More options"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      {getRoomTypeIcon(selectedRoom)}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      {selectedRoom.type === 'ai_assistant' 
                        ? 'Ask me anything about your project or get help with bug tracking!'
                        : 'Send your first message to get the conversation started.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-1">
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      currentUserId={user?.id || 0}
                      onReply={setReplyTo}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              replyTo={replyTo || undefined}
              onCancelReply={() => setReplyTo(null)}
              placeholder={
                selectedRoom.type === 'ai_assistant' 
                  ? 'Ask me anything...'
                  : 'Type a message...'
              }
            />
          </>
        ) : (
          /* No Room Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            {isMobileView ? (
              <div className="text-center p-8">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select a Chat
                </button>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation to start chatting
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a chat room from the sidebar to start messaging
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Info Sidebar */}
      {showChatInfo && selectedRoom && (
        <ChatInfo
          room={selectedRoom}
          onClose={() => setShowChatInfo(false)}
          onToggleMute={() => toggleMute(selectedRoom.id)}
          onTogglePin={() => togglePin(selectedRoom.id)}
        />
      )}

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          onClose={() => setShowCreateModal(false)}
          onChatCreated={(newRoom) => {
            setRooms(prev => [newRoom, ...prev]);
            setSelectedRoom(newRoom);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Chat;