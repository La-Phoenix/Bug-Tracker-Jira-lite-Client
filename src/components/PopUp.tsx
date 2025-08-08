import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  isOpen,
  onClose,
  title = 'Error',
  message,
  autoClose = false,
  autoCloseDelay = 5000,
  type = 'error'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          icon: 'text-yellow-400',
          title: 'text-yellow-100'
        };
      case 'info':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          icon: 'text-blue-400',
          title: 'text-blue-100'
        };
      default:
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          icon: 'text-red-400',
          title: 'text-red-100'
        };
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`relative max-w-md w-full bg-gray-900 border ${styles.border} rounded-xl shadow-2xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className={`${styles.bg} px-6 py-4 rounded-t-xl border-b border-gray-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className={`w-6 h-6 ${styles.icon}`} />
              <h3 className={`text-lg font-semibold ${styles.title}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800/50 rounded-b-xl border-t border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing error popup state
export const useErrorPopup = () => {
  const [error, setError] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
  });

  const showError = (
    message: string, 
    title?: string, 
    type: 'error' | 'warning' | 'info' = 'error'
  ) => {
    setError({
      isOpen: true,
      message,
      title,
      type,
    });
  };

  const hideError = () => {
    setError(prev => ({ ...prev, isOpen: false }));
  };

  return {
    error,
    showError,
    hideError,
  };
};