import React, { useState } from 'react';
import { Reply, Edit3, Trash2, MoreVertical } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';

interface MessageProps {
  message: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: number) => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  onReply,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = user?.id === message.senderId;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {getInitials(message.senderName)}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message.senderName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
          )}
        </div>

        {/* Message Body */}
        <div className={`${isOwnMessage ? 'text-right' : ''}`}>
          {message.type === 'text' ? (
            <div className={`inline-block max-w-lg p-3 rounded-lg ${
              isOwnMessage 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          ) : message.type === 'file' ? (
            <div className="inline-flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                  {message.fileName?.split('.').pop()?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-900 dark:text-white">
                {message.fileName}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isOwnMessage ? 'order-first' : ''
        }`}>
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Reply"
            >
              <Reply className="h-4 w-4" />
            </button>
          )}
          
          {isOwnMessage && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
          
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};