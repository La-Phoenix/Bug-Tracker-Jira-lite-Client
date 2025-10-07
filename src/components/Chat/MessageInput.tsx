import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image,
  Smile,
  Mic,
  MicOff,
  X,
  File,
  Camera,
  Plus
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'file' | 'voice') => void;
  onTyping?: () => void;
  replyTo?: {
    id: number;
    content: string;
    senderName: string;
  };
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
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
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const value = e.target.value;
    setMessage(value);
    autoResizeTextarea(e.target);
    
    // Trigger typing indicator
    if (value.trim() && onTyping) {
      onTyping();
    }
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 6 lines
    textarea.style.height = newHeight + 'px';
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      console.log('File selected:', file);
      onSendMessage(`📎 ${file.name}`, 'file');
    }
    setShowAttachMenu(false);
    if (e.target) e.target.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Check file size (5MB limit for images)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }
      console.log('Image selected:', file);
      onSendMessage(`🖼️ ${file.name}`, 'file');
    }
    setShowAttachMenu(false);
    if (e.target) e.target.value = '';
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped');
    onSendMessage(`🎵 Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`, 'voice');
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
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
    <div className="bg-white dark:bg-gray-800">
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-1">
                <span>Replying to {replyTo.senderName}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {replyTo.content}
              </p>
            </div>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                  Recording {formatTime(recordingTime)}
                </span>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-2">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Attach Button */}
          <div className="relative" ref={attachMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              disabled={disabled || isRecording}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Attach"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Attachment Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-3 min-w-[200px] z-20">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Document</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Gallery</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip,.rar"
          />
          <input
            ref={imageInputRef}
            type="file"
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />

          {/* Input Field */}
          <div className="flex-1 relative bg-gray-100 dark:bg-gray-700 rounded-3xl overflow-hidden">
            <div className="flex items-end">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled || isRecording}
                rows={1}
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-5"
                style={{ minHeight: '20px', maxHeight: '120px' }}
              />
              
              {/* Emoji Button */}
              <div className="relative mr-2" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowAttachMenu(false);
                  }}
                  disabled={disabled || isRecording}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 z-20">
                    <div className="grid grid-cols-6 gap-2 w-60">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send/Voice Button */}
          <div className="flex-shrink-0">
            {message.trim() ? (
              <button
                type="submit"
                disabled={disabled}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={`p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title={isRecording ? "Stop recording" : "Record voice message"}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};