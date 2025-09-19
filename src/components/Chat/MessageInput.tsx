import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import type { ChatMessage } from '../../types/interface';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'file') => void;
  replyTo?: ChatMessage;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyTo,
  onCancelReply,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  console.log(setIsTyping)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      console.log('File selected:', file);
      // You would typically upload the file and then send a file message
      onSendMessage(`Shared file: ${file.name}`, 'file');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
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

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-3">
          {/* File Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={disabled}
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              disabled={disabled}
              className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Someone is typing...
          </div>
        )}
      </form>
    </div>
  );
};