import React, { useState, useRef, useEffect } from 'react';
import {
  Reply,
  MoreVertical,
  Edit,
  Download,
  Check,
  X,
  Trash2,
  Copy,
  Eye,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Forward,
  Star,
  Flag
} from 'lucide-react';
import type { ChatMessage } from '../../types/interface';
import { FilePreviewModal } from './FilePreviewModal';

interface MessageProps {
  message: ChatMessage;
  currentUserId: number;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (messageId: number, newContent: string) => Promise<void>;
  onDelete?: (messageId: number) => Promise<boolean>;
}

export const Message: React.FC<MessageProps> = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isOwnMessage = message.senderId === currentUserId;

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAdvancedFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'webm':
        return <VideoIcon className="h-5 w-5 text-red-500" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="h-5 w-5 text-purple-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const isPreviewableFile = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const previewableExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      'pdf', 'txt', 'md',
      'mp4', 'webm', 'ogg',
      'mp3', 'wav'
    ];
    return previewableExtensions.includes(extension || '');
  };

  const handleFileDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  // NOW PROPERLY USED: Image preview handler
  const handleImagePreview = () => {
    setShowFilePreview(true);
  };

  // File preview handler for non-images
  const handleFilePreview = () => {
    setShowFilePreview(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent.trim() !== message.content && onEdit) {
      await onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      const success = await onDelete(message.id);
      setIsDeleting(false);
      if (success) {
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setShowMoreMenu(false);
    setShowActions(false);
  };

  const handleForwardMessage = () => {
    console.log('Forward message:', message.id);
    setShowMoreMenu(false);
    setShowActions(false);
  };

  const handleStarMessage = () => {
    console.log('Star message:', message.id);
    setShowMoreMenu(false);
    setShowActions(false);
  };

  const handleReportMessage = () => {
    console.log('Report message:', message.id);
    setShowMoreMenu(false);
    setShowActions(false);
  };

  return (
    <>
      <div 
        className={`group flex gap-3 px-2 sm:px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
          isOwnMessage ? 'flex-row-reverse' : ''
        }`}
        onMouseEnter={() => !isEditing && setShowActions(true)}
        onMouseLeave={() => !isEditing && !showMoreMenu && setShowActions(false)}
      >
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
            {message.senderAvatar ? (
              <img src={message.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              message.senderName?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%] sm:max-w-md lg:max-w-lg xl:max-w-xl`}>
          {/* Sender Name & Time */}
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {message.senderName || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}

          {/* Message Bubble */}
          <div className={`relative group/message ${isOwnMessage ? 'ml-auto' : ''}`}>
            <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 relative shadow-sm ${
              isOwnMessage 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-bl-md'
            }`}>
              {/* Reply Context */}
              {message.replyTo && (
                <div className={`mb-2 p-2 rounded-lg border-l-2 text-xs ${
                  isOwnMessage 
                    ? 'bg-blue-700 border-blue-300' 
                    : 'bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                }`}>
                  <div className="font-medium opacity-75">
                    {message.replyTo.senderName}
                  </div>
                  <div className="opacity-60 truncate">
                    {message.replyTo.content}
                  </div>
                </div>
              )}

              {/* Text Message Content */}
              {message.type.toLowerCase() === 'text' && (
                <div className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        ref={editInputRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded resize-none text-gray-900 dark:text-white"
                        rows={2}
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className={`p-1 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            editContent.trim() && editContent.trim() !== message.content
                              ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!editContent.trim() || editContent.trim() === message.content}
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </div>
                  )}
                </div>
              )}

              {/* File/Image Message Content */}
              {(message.type.toLowerCase() === 'file' || message.type.toLowerCase() === 'image') && (
                <div className="space-y-2">
                  {message.type.toLowerCase() === 'image' && message.fileUrl ? (
                    <div className="max-w-xs">
                      {/* FIXED: Now using handleImagePreview */}
                      <div className="relative group cursor-pointer" onClick={handleImagePreview}>
                        <img 
                          src={message.fileUrl} 
                          alt={message.fileName}
                          className="rounded-lg max-h-60 w-full object-cover hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImagePreview();
                              }}
                              className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDownload(message.fileUrl!, message.fileName!);
                              }}
                              className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
                              title="Download"
                            >
                              <Download className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {message.content && (
                        <div className="mt-2 text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`flex items-center gap-3 p-3 rounded-lg max-w-sm group hover:bg-opacity-80 transition-colors ${
                      isOwnMessage ? 'bg-blue-700' : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      <div className="text-2xl flex-shrink-0">
                        {getAdvancedFileIcon(message.fileName || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" title={message.fileName}>
                          {message.fileName}
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <span>{formatFileSize(message.fileSize)}</span>
                          {isPreviewableFile(message.fileName || '') && (
                            <span className={isOwnMessage ? 'text-blue-200' : 'text-blue-500'}>• Previewable</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleFileDownload(message.fileUrl!, message.fileName!)}
                          className={`p-1 transition-colors flex-shrink-0 ${
                            isOwnMessage 
                              ? 'text-blue-100 hover:text-white' 
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {isPreviewableFile(message.fileName || '') && (
                          <button 
                            onClick={handleFilePreview}
                            className={`p-1 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 ${
                              isOwnMessage 
                                ? 'text-blue-100 hover:text-white' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Message */}
              {message.type.toLowerCase() === 'voice' && (
                <div className="flex items-center gap-3 p-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isOwnMessage ? 'bg-blue-700' : 'bg-blue-500'
                  }`}>
                    <Music className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Voice Message</div>
                    <div className="text-xs opacity-75">0:15</div>
                  </div>
                  <button className={`p-2 rounded-full transition-colors ${
                    isOwnMessage ? 'hover:bg-blue-700' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Time for own messages */}
            {isOwnMessage && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {new Date(message.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {message.isEdited && <span className="ml-1">(edited)</span>}
              </div>
            )}

            {/* Professional Message Actions */}
            {showActions && !isEditing && (
              <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10`}>
                <button
                  onClick={() => onReply?.(message)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-lg"
                  title="Reply"
                >
                  <Reply className="h-4 w-4" />
                </button>
                
                {message.type.toLowerCase() === 'text' && (
                  <button
                    onClick={handleCopyMessage}
                    className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
                
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-lg"
                    title="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {/* Professional More Menu */}
                  {showMoreMenu && (
                    <div className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-20`}>
                      {isOwnMessage && message.type.toLowerCase() === 'text' && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMoreMenu(false);
                            setShowActions(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit message
                        </button>
                      )}
                      
                      <button
                        onClick={handleForwardMessage}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Forward className="h-4 w-4" />
                        Forward
                      </button>
                      
                      <button
                        onClick={handleStarMessage}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Star className="h-4 w-4" />
                        Star message
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      
                      {!isOwnMessage && (
                        <button
                          onClick={handleReportMessage}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        >
                          <Flag className="h-4 w-4" />
                          Report message
                        </button>
                      )}
                      
                      {isOwnMessage && (
                        <button
                          onClick={() => {
                            setIsDeleteModalOpen(true);
                            setShowMoreMenu(false);
                            setShowActions(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete message
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && message.fileUrl && (
        <FilePreviewModal
          isOpen={showFilePreview}
          onClose={() => setShowFilePreview(false)}
          fileUrl={message.fileUrl}
          fileName={message.fileName || 'Unknown file'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Message
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};