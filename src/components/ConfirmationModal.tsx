import React from 'react';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info' | 'success'; // Add this prop
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // Default to warning
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          iconBg: 'bg-amber-100 dark:bg-amber-900/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6" />,
          iconBg: 'bg-green-100 dark:bg-green-900/20',
          iconColor: 'text-green-600 dark:text-green-400',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          iconBg: 'bg-gray-100 dark:bg-gray-900/20',
          iconColor: 'text-gray-600 dark:text-gray-400',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const styles = getVariantStyles();

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
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className={styles.iconColor}>
                {styles.icon}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
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
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {message}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 ${styles.button} text-white rounded-lg transition-colors disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};