import React from 'react';
import { Bug } from 'lucide-react';

interface AppLoaderProps {
  message?: string;
  title?: string;
  variant?: 'auth' | 'page' | 'inline';
}

export const AppLoader: React.FC<AppLoaderProps> = ({ 
  message = "Loading...", 
  title = "BugTrackr",
  variant = 'page'
}) => {
  const getContainerClass = () => {
    switch (variant) {
      case 'auth':
        return "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center";
      case 'page':
        return "flex items-center justify-center py-12";
      case 'inline':
        return "flex items-center justify-center p-4";
      default:
        return "flex items-center justify-center py-12";
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'auth':
        return "h-12 w-12";
      case 'page':
        return "h-10 w-10";
      case 'inline':
        return "h-6 w-6";
      default:
        return "h-10 w-10";
    }
  };

  return (
    <div className={getContainerClass()}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Bug className={`${getIconSize()} text-blue-600 dark:text-blue-400 animate-bounce`} />
            <div className={`absolute inset-0 ${getIconSize()} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}></div>
          </div>
        </div>
        
        {variant === 'auth' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
              {message}
            </p>
          </>
        )}
        
        {variant === 'page' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {message}
          </p>
        )}
        
        {variant === 'inline' && (
          <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};