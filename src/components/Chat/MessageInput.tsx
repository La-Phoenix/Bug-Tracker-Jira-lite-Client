import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  X, 
  Mic, 
  MicOff, 
  Image, 
  File, 
  AtSign,
  Hash,
  Bold,
  Italic,
  Code,
  MoreHorizontal
} from 'lucide-react';
import type { ChatMessage } from '../../types/interface';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'file' | 'voice') => void;
  replyTo?: ChatMessage;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Type a message...'
}) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showFormatting, setShowFormatting] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const commonEmojis = ['😀', '😂', '😍', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '✅'];

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showAttachMenu || showEmojiPicker) {
        setShowAttachMenu(false);
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu, showEmojiPicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      resetTextareaHeight();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    autoResizeTextarea(e.target);
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file);
      onSendMessage(`Shared file: ${file.name}`, 'file');
    }
    setShowAttachMenu(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Image selected:', file);
      onSendMessage(`Shared image: ${file.name}`, 'file');
    }
    setShowAttachMenu(false);
  };

  const startRecording = async () => {
    try {
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      console.log('Recording started');
      // Implement actual recording logic here
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped');
    // Implement stop recording and send voice message
    onSendMessage(`Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`, 'voice');
  };

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        break;
      default:
        return;
    }

    const newMessage = message.substring(0, start) + newText + message.substring(end);
    setMessage(newMessage);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Replying to</span>
                <span className="font-medium">{replyTo.senderName}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                {replyTo.content}
              </p>
            </div>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                Recording {formatTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors"
            >
              Stop & Send
            </button>
          </div>
        </div>
      )}

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => insertFormatting('bold')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('italic')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('code')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              title="Code"
            >
              <Code className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
            <button
              onClick={() => setMessage(prev => prev + '@')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              title="Mention"
            >
              <AtSign className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMessage(prev => prev + '#')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              title="Channel"
            >
              <Hash className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Attachment Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={disabled || isRecording}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Attachment Menu Dropdown */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[150px] z-10">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Image className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Image</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <File className="h-4 w-4 text-green-500" />
                  <span className="text-sm">File</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
          />
          <input
            ref={imageInputRef}
            type="file"
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />

          {/* Text Input Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isRecording}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Formatting Toggle */}
            <button
              type="button"
              onClick={() => setShowFormatting(!showFormatting)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Formatting options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled || isRecording}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Emoji Picker Dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10">
                <div className="grid grid-cols-6 gap-1 w-64">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => insertEmoji(emoji)}
                      className="p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voice/Send Button */}
          {message.trim() ? (
            <button
              type="submit"
              disabled={disabled}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};