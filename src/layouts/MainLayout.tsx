import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/UI/Sidebar';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [headerVisible, setHeaderVisible] = useState(false); // Hidden by default on mobile

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Only auto-close sidebar if switching to mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Always show header on desktop
        setHeaderVisible(true);
      }
    };

    // Set initial header visibility
    const mobile = window.innerWidth < 1024;
    setHeaderVisible(!mobile); // Show on desktop, hide on mobile by default

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarClose = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const toggleHeader = () => {
    if (isMobile) {
      setHeaderVisible(!headerVisible);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />

      {/* Main content wrapper */}
      <div
        className={`
          flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300 ease-in-out
          ${!isMobile && sidebarOpen ? 'lg:ml-64' : ''}
        `}
      >
        {/* Header - Conditionally rendered */}
        {headerVisible && (
          <div className="flex-shrink-0 z-10">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>
        )}

        {/* Mobile Header Toggle Button */}
        {isMobile && (
          <button
            onClick={toggleHeader}
            className="fixed top-2 right-2 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={headerVisible ? 'Hide header' : 'Show header'}
          >
            {headerVisible ? (
              <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        )}

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={handleSidebarClose}
        />
      )}
    </div>
  );
};