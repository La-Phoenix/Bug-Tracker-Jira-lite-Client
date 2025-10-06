import React from 'react';
import { 
  Users, 
  Hash, 
  Bot, 
  Pin, 
  VolumeX, 
  UserCheck,
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import type { ChatRoom } from '../../types/interface';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId?: number;
  onRoomSelect: (room: ChatRoom) => void;
  onToggleMute?: (roomId: number) => void;
  onTogglePin?: (roomId: number) => void;
  loading?: boolean;
  currentUserId: number;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  onToggleMute,
  onTogglePin,
  loading = false,
  currentUserId
}) => {
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
      console.log("room:", room)
      console.log("otherParticipant:", otherParticipant)
      return otherParticipant?.userName || 'Unknown User';
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

  const getOnlineCount = (room: ChatRoom) => {
    return room.participants.filter(p => p.isOnline).length;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
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
    <div className="p-2">
      {rooms.length === 0 ? (
        <div className="text-center p-8">
          <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No conversations yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Create a new chat to get started
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {rooms.map((room) => {
            const displayName = getRoomDisplayName(room);
            console.log("dssp: ", displayName)
            const roomAvatar = getRoomAvatar(room);
            const otherParticipant = room.type === 'direct' 
              ? room.participants.find(p => p.userId !== currentUserId)
              : null;
            
            return (
              <div
                key={room.id}
                className={`group relative rounded-lg transition-all duration-200 ${
                  selectedRoomId === room.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <button
                  onClick={() => onRoomSelect(room)}
                  className="w-full p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar/Icon */}
                    <div className="relative flex-shrink-0">
                      {roomAvatar ? (
                        <img 
                          src={roomAvatar} 
                          alt={displayName} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          room.type === 'direct' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : room.type === 'project'
                            ? 'bg-purple-100 dark:bg-purple-900/20'
                            : room.type === 'ai_assistant'
                            ? 'bg-orange-100 dark:bg-orange-900/20'
                            : 'bg-blue-100 dark:bg-blue-900/20'
                        }`}>
                          {room.type === 'direct' ? (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            getRoomIcon(room)
                          )}
                        </div>
                      )}
                      
                      {/* Online indicator for direct chats */}
                      {room.type === 'direct' && otherParticipant?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {displayName}
                          </h3>
                          
                          {/* Room indicators */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {room.isPinned && (
                              <Pin className="h-3 w-3 text-yellow-500" />
                            )}
                            {room.isMuted && (
                              <VolumeX className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Time and unread count */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {room.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLastMessageTime(room.lastMessage.createdAt)}
                            </span>
                          )}
                          {room.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Last message or status */}
                      {room.lastMessage ? (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {room.lastMessage.type === 'text' ? (
                              <>
                                <span className="font-medium">
                                  {room.lastMessage.senderId === currentUserId ? 'You' : room.lastMessage.senderName}:
                                </span>{' '}
                                {room.lastMessage.content}
                              </>
                            ) : (
                              <>
                                <span className="font-medium">
                                  {room.lastMessage.senderId === currentUserId ? 'You' : room.lastMessage.senderName}
                                </span>{' '}
                                sent {room.lastMessage.type === 'image' ? 'an image' : 'a file'}
                              </>
                            )}
                          </p>
                        </div>
                      ) : room.type === 'direct' ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {otherParticipant?.isOnline ? 'Online' : 'Offline'}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {room.description || 'No messages yet'}
                        </p>
                      )}

                      {/* Participants info for non-direct chats */}
                      {room.type !== 'direct' && room.type !== 'ai_assistant' && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {room.participants.length} members
                          </span>
                          {getOnlineCount(room) > 0 && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-green-500">
                                {getOnlineCount(room)} online
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>

              {/* Quick actions menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  {onTogglePin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(room.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        room.isPinned 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={room.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                  )}
                  
                  {onToggleMute && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute(room.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        room.isMuted 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={room.isMuted ? 'Unmute' : 'Mute'}
                    >
                      <VolumeX className="h-3 w-3" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};