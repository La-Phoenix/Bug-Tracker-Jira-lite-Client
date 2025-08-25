import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface MessagePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  title: string;
  placeholder?: string;
  isLoading?: boolean;
}

export const MessagePromptModal: React.FC<MessagePromptModalProps> = ({
  isOpen,
  onClose,
  onSend,
  title,
  placeholder = 'Enter your message...',
  isLoading = false
}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
              {title}
            </h3>
            {!isLoading && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mb-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};