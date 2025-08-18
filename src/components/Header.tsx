import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Bug } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bug className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                BugTrackr Pro
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {user && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogoutClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your dashboard."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
        loading={isLoggingOut}
      />
    </>
  );
};