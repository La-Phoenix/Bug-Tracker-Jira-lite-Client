import React, { useState } from 'react';
import {
  Reply,
  MoreVertical,
  Edit,
  Smile,
  Download,
} from 'lucide-react';
import type { ChatMessage } from '../../types/interface';

interface MessageProps {
  message: ChatMessage;
  currentUserId: number;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: number) => void;
  onReaction?: (messageId: number, emoji: string) => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onReaction
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = message.senderId === currentUserId;
  const isSystemMessage = message.type === 'system';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group flex gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {message.senderAvatar ? (
            <img src={message.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            message.senderName.charAt(0).toUpperCase()
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Sender Name & Time */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {message.senderName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}
          </div>
        )}

        {/* Reply Context */}
        {message.replyTo && (
          <div className={`mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded border-l-4 border-blue-500 ${
            isOwnMessage ? 'ml-auto max-w-xs' : 'max-w-xs'
          }`}>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
              Replying to {message.replyTo.senderName}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative inline-block max-w-lg ${isOwnMessage ? 'ml-auto' : ''}`}>
          <div className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}>
            {/* Text Message */}
            {message.type === 'text' && (
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.content}
              </div>
            )}

            {/* File Message */}
            {(message.type === 'file' || message.type === 'image') && (
              <div className="space-y-2">
                {message.type === 'image' && message.fileUrl ? (
                  <div className="max-w-sm">
                    <img 
                      src={message.fileUrl} 
                      alt={message.fileName}
                      className="rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    />
                    {message.content && (
                      <div className="mt-2 text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg max-w-sm">
                    <div className="text-2xl">{getFileIcon(message.fileName || '')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {message.fileName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(message.fileSize)}
                      </div>
                    </div>
                    <button 
                      onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Voice Message */}
            {message.type === 'voice' && (
              <div className="flex items-center gap-3 min-w-[200px]">
                <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  ▶️
                </button>
                <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.duration ? `${Math.floor(message.duration / 60)}:${(message.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                </span>
              </div>
            )}

            {/* Call Messages */}
            {(message.type === 'audio_call' || message.type === 'video_call') && (
              <div className="flex items-center gap-2 text-sm">
                {message.type === 'video_call' ? '📹' : '📞'}
                <span>{message.content}</span>
              </div>
            )}
          </div>

          {/* Timestamp for own messages */}
          {isOwnMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatTime(message.createdAt)}
              {message.isEdited && <span className="ml-1 italic">(edited)</span>}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => onReaction?.(message.id, reaction.emoji)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className={`flex items-center gap-1 ${isOwnMessage ? 'order-first mr-2' : 'ml-2'}`}>
          <button
            onClick={() => onReply?.(message)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </button>

          {isOwnMessage && (
            <button
              onClick={() => onEdit?.(message)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onReaction?.(message.id, emoji);
                setShowReactions(false);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};