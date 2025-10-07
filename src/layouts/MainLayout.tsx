import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/UI/Sidebar';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile view on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when window resizes to mobile
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen]);

  // Close sidebar when clicking outside on mobile
  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content wrapper - Mobile responsive */}
      <div className={`
        flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300 ease-in-out
        ${!isMobile ? 'lg:ml-64' : ''}
      `}>
        
        {/* Header - Mobile optimized */}
        <div className="flex-shrink-0 z-10">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Main content area - Improved scrolling */}
        <main className="flex-1 min-h-0 overflow-y-auto ultra-thin-scrollbar bg-gray-50 dark:bg-gray-900">
          <div className="p-3 sm:p-4 lg:p-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
          onClick={handleSidebarClose}
        />
      )}
    </div>
  );
};