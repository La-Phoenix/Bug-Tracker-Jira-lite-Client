import React, { useState, useRef, useEffect } from 'react';
import {
  Reply,
  MoreVertical,
  Edit,
  Smile,
  Download,
  Check,
  X,
  Trash2,
  Copy,
  Flag
} from 'lucide-react';
import type { ChatMessage } from '../../types/interface';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

interface MessageProps {
  message: ChatMessage;
  currentUserId: number;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (messageId: number, newContent: string) => void;
  onDelete?: (messageId: number) => Promise<boolean>;
  onReaction?: (messageId: number, emoji: string) => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);


  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const isOwnMessage = message.senderId === currentUserId;
  const isSystemMessage = message.type.toLowerCase() === 'system';
  const canEdit = isOwnMessage && message.type.toLowerCase() === 'text';
  const canDelete = isOwnMessage;

  // Focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Close menus when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = () => {
  //     setShowReactions(false);
  //     setShowMoreMenu(false);
  //   };

  //   if (showReactions || showMoreMenu) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => document.removeEventListener('mousedown', handleClickOutside);
  //   }
  // }, [showReactions, showMoreMenu]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowReactions(false);
        setShowMoreMenu(false);
      }
    };

    if (showReactions || showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showReactions, showMoreMenu]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Today
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }

    // Yesterday
    if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    }

    // Within last 7 days
    if (diffDays <= 7) {
      return (
        date.toLocaleDateString("en-US", { weekday: "short" }) +
        " " +
        date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }

    // Older
    return (
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
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

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setShowActions(false);
    setShowMoreMenu(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleDeleteMessage = () => {
    setIsDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setIsDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    if (onDelete) {
      if (await onDelete(message.id)){
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      }
    }
    setShowMoreMenu(false);
  }

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
      className={`group flex gap-2 sm:gap-3 px-2 sm:px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => !isEditing && setShowActions(true)}
      onMouseLeave={() => !isEditing && setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0 mt-1">
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {message.senderName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formatTime(message.updatedAt)}
            </span>
            {message.isEdited && (
              <span className="text-xs text-gray-400 italic flex-shrink-0">(edited)</span>
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
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative inline-block max-w-full sm:max-w-lg ${isOwnMessage ? 'ml-auto' : ''}`}>
          <div className={`px-3 sm:px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}>
            {/* Text Message */}
            {message.type.toLowerCase() === 'text' && (
              <div className="text-sm">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      ref={editInputRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`w-full min-h-[60px] p-2 text-sm rounded border resize-none ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white border-blue-400 placeholder-blue-200'
                          : 'bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Enter your message..."
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className={`p-1 rounded transition-colors ${
                          isOwnMessage
                            ? 'text-blue-200 hover:text-white hover:bg-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim() || editContent.trim() === message.content}
                        className={`p-1 rounded transition-colors ${
                          isOwnMessage
                            ? 'text-blue-200 hover:text-white hover:bg-blue-500 disabled:text-blue-300 disabled:cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed'
                        }`}
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                )}
              </div>
            )}

            {/* File Message */}
            {(message.type.toLowerCase() === 'file' || message.type.toLowerCase() === 'image') && (
              <div className="space-y-2">
                {message.type.toLowerCase() === 'image' && message.fileUrl ? (
                  <div className="max-w-sm">
                    <img 
                      src={message.fileUrl} 
                      alt={message.fileName}
                      className="rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    />
                    {message.content && (
                      <div className="mt-2 text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg max-w-full sm:max-w-sm">
                    <div className="text-2xl flex-shrink-0">{getFileIcon(message.fileName || '')}</div>
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
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Voice Message */}
            {message.type.toLowerCase() === 'voice' && (
              <div className="flex items-center gap-3 min-w-[180px] sm:min-w-[200px]">
                <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  ▶️
                </button>
                <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {message.duration ? `${Math.floor(message.duration / 60)}:${(message.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                </span>
              </div>
            )}
          </div>

          {/* Timestamp for own messages */}
          {isOwnMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatTime(message.updatedAt)}
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
      {(showActions || isEditing) && !isEditing && (
        <div className={`flex items-center gap-1 ${isOwnMessage ? 'order-first mr-1 sm:mr-2' : 'ml-1 sm:ml-2'}`}>
          <button
            onClick={() => onReply?.(message)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </button>

          {canEdit && (
            <button
              onClick={handleStartEdit}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          <div ref={moreMenuRef} className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* More Menu */}
            {showMoreMenu && (
              <div className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] z-20`}>
                <button
                  onClick={handleCopyMessage}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy text
                </button>
                
                {canDelete && (
                  <button
                    onClick={handleDeleteMessage}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
                
                {!isOwnMessage && (
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-0 transform -translate-y-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-20`}>
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onReaction?.(message.id, emoji);
                setShowReactions(false);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Chat Message"
        itemName={message.content || ''}
        itemType="Chat Message"
        description=""
        isDeleting={isDeleting}
      />
    </div>

  );
};