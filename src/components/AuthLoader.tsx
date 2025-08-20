import React from 'react';
import { Bug } from 'lucide-react';

export const AuthLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Bug className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-bounce" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Initializing BugTrackr
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          Setting up your workspace...
        </p>
      </div>
    </div>
  );
};