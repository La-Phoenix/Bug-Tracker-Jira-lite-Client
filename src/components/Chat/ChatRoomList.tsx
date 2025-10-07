import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Hash,
  Bot,
  UserCheck,
  Pin,
  VolumeX,
  MoreVertical,
  Archive,
  Trash2,
  MessageSquare,
  Bell,
  BellOff
} from 'lucide-react';
import type { ChatRoom, ChatParticipant } from '../../types/interface';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null; // Changed from selectedRoomId
  onRoomSelect: (room: ChatRoom) => void;
  onCreateChat: () => void;
  currentUserId: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter?: 'all' | 'pinned' | 'muted' | 'unread';
  onFilterChange?: (filter: 'all' | 'pinned' | 'muted' | 'unread') => void;
  onTogglePin?: (roomId: number) => void;
  onToggleMute?: (roomId: number) => void;
  loading?: boolean;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  onCreateChat,
  currentUserId,
  searchTerm,
  onSearchChange,
  filter = 'all',
  onFilterChange,
  onTogglePin,
  onToggleMute,
  loading = false
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);

  const getRoomIcon = (room: ChatRoom) => {
    switch (room.type) {
      case 'direct':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'group':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'project':
        return <Hash className="h-4 w-4 text-purple-600" />;
      case 'ai_assistant':
        return <Bot className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p.userId !== currentUserId);
      if (!otherParticipant) {
        const self = room.participants.find(p => p.userId === currentUserId);
        return self ? `${self.userName} (You)` : 'Unknown';
      }
      return otherParticipant.userName;
    }
    return room.name;
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p.userId !== currentUserId);
      return otherParticipant?.avatar || room.avatar;
    }
    return room.avatar;
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter rooms based on current filter
  const filteredRooms = rooms.filter(room => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.lastMessage?.content || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Apply type filter
    switch (filter) {
      case 'pinned':
        return room.isPinned;
      case 'muted':
        return room.isMuted;
      case 'unread':
        return room.unreadCount > 0;
      case 'all':
      default:
        return true;
    }
  });


  // const getLastMessagePreview = (room: ChatRoom) => {
  //   if (!room.lastMessage) return 'No messages yet';
    
  //   if (room.type === 'direct') {
  //     let otherParticipant: ChatParticipant | null = null;
  //     if (room.participants.length === 2) {
  //       otherParticipant = room.participants.find(p => p.userId !== currentUserId) || null;
  //     }
      
  //     const isFromSelf = room.lastMessage.senderId === currentUserId;
  //     const senderName = isFromSelf ? 'You' : (otherParticipant?.userName || 'Unknown');
      
  //     let messagePreview = '';
  //     if (room.lastMessage.type === 'text') {
  //       messagePreview = room.lastMessage.content;
  //     } else if (room.lastMessage.type === 'file') {
  //       messagePreview = `📎 ${room.lastMessage.fileName || 'File'}`;
  //     } else if (room.lastMessage.type === 'image') {
  //       messagePreview = '📷 Photo';
  //     } else if (room.lastMessage.type === 'voice') {
  //       messagePreview = '🎤 Voice message';
  //     }
      
  //     return `${senderName}: ${messagePreview}`;
  //   } else {
  //     const senderName = room.lastMessage.senderId === currentUserId ? 'You' : room.lastMessage.senderName;
  //     let messagePreview = '';
      
  //     if (room.lastMessage.type === 'text') {
  //       messagePreview = room.lastMessage.content;
  //     } else if (room.lastMessage.type === 'file') {
  //       messagePreview = `📎 ${room.lastMessage.fileName || 'File'}`;
  //     } else if (room.lastMessage.type === 'image') {
  //       messagePreview = '📷 Photo';
  //     } else if (room.lastMessage.type === 'voice') {
  //       messagePreview = '🎤 Voice message';
  //     }
      
  //     return `${senderName}: ${messagePreview}`;
  //   }
  // };
  

  if (loading) {
    return (
      <div className="p-2 space-y-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Search and Filter Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'pinned', 'muted', 'unread'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => onFilterChange?.(filterType)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Create Chat Button */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onCreateChat}
          className="w-full flex items-center gap-3 p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="text-center p-8">
            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {searchTerm ? 'Try a different search term' : 'Create a new chat to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredRooms.map((room) => {
              const displayName = getRoomDisplayName(room);
              const roomAvatar = getRoomAvatar(room);
              let otherParticipant: ChatParticipant | null = null;

              if (room.type === 'direct') {
                otherParticipant = room.participants.find(p => p.userId !== currentUserId) || null;
              }
              
              return (
                <div
                  key={room.id}
                  className={`group relative transition-all duration-200 ${
                    selectedRoom?.id === room.id
                      ? 'bg-green-50 dark:bg-green-900/10 border-r-4 border-green-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center p-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0 mr-3">
                      {roomAvatar ? (
                        <img 
                          src={roomAvatar} 
                          alt={displayName} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          room.type === 'direct' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                            : room.type === 'project'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                            : room.type === 'ai_assistant'
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                            : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                        }`}>
                          {room.type === 'direct' ? (
                            <span className="text-sm font-semibold text-white">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <div className="text-white">
                              {getRoomIcon(room)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Online indicator for direct chats */}
                      {room.type === 'direct' && otherParticipant?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onRoomSelect(room)}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h3 className={`font-medium truncate ${
                            selectedRoom?.id === room.id 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {displayName}
                          </h3>
                          
                          {/* Status indicators */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {room.isPinned && (
                              <Pin className="h-3 w-3 text-blue-500" />
                            )}
                            {room.isMuted && (
                              <VolumeX className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Time and unread count */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {room.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLastMessageTime(room.lastMessage.createdAt)}
                            </span>
                          )}
                          {room.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Last message preview */}
                      <div className="flex items-center justify-between">
                        {room.lastMessage ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                            {room.lastMessage.type === 'text' ? (
                              <>
                                {room.lastMessage.senderId === currentUserId && (
                                  <span className="text-blue-500 mr-1">✓</span>
                                )}
                                {room.lastMessage.content}
                              </>
                            ) : (
                              <>
                                {room.lastMessage.senderId === currentUserId && (
                                  <span className="text-blue-500 mr-1">✓</span>
                                )}
                                <span className="italic">
                                  {room.lastMessage.type === 'image' ? '📷 Photo' : 
                                   room.lastMessage.type === 'file' ? '📄 File' : 
                                   room.lastMessage.type === 'voice' ? '🎵 Voice message' : 
                                   'Media message'}
                                </span>
                              </>
                            )}
                          </p>
                        ) : room.type === 'direct' ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {otherParticipant?.isOnline ? 'Online' : 'Tap to start chatting'}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {room.description || 'No messages yet'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* More menu */}
                    <div className="relative flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoreMenu(showMoreMenu === room.id ? null : room.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown menu */}
                      {showMoreMenu === room.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin?.(room.id);
                              setShowMoreMenu(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Pin className="h-4 w-4" />
                            {room.isPinned ? 'Unpin chat' : 'Pin chat'}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleMute?.(room.id);
                              setShowMoreMenu(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {room.isMuted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                            {room.isMuted ? 'Unmute notifications' : 'Mute notifications'}
                          </button>

                          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoreMenu(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Archive className="h-4 w-4" />
                            Archive chat
                          </button>
                          
                          {room.type !== 'ai_assistant' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMoreMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete chat
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};