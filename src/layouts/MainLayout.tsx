import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/UI/Sidebar';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Only auto-close sidebar if switching to mobile
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarClose = () => {
    if (isMobile) setSidebarOpen(false);
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
        {/* Header */}
        <div className="flex-shrink-0 z-10">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

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
