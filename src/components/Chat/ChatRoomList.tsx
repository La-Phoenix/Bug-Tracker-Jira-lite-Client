import React from 'react';
import { MessageSquare, Users, Folder, Hash, UserCheck } from 'lucide-react';
import type { ChatRoom } from '../../types/interface';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId?: number;
  onRoomSelect: (room: ChatRoom) => void;
  loading?: boolean;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  loading = false
}) => {
  const getRoomIcon = (type: ChatRoom['type']) => {
    switch (type) {
      case 'direct':
        return <UserCheck className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'project':
        return <Folder className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
    <div className="space-y-1">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onRoomSelect(room)}
          className={`w-full p-3 text-left rounded-lg transition-colors ${
            selectedRoomId === room.id
              ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Room Icon */}
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              room.type === 'direct' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : room.type === 'project'
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            }`}>
              {getRoomIcon(room.type)}
            </div>

            {/* Room Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {room.name}
                </h3>
                {room.lastMessage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatLastMessageTime(room.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              
              {room.lastMessage ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    <span className="font-medium">{room.lastMessage.senderName}:</span>{' '}
                    {room.lastMessage.content}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">No messages yet</p>
              )}

              {/* Participants preview for group chats */}
              {room.type !== 'direct' && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {room.participants.length} members
                  </span>
                  {room.participants.some(p => p.isOnline) && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};