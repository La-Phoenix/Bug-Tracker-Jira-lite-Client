import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/UI/Sidebar';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content - ensure it has proper left padding on large screens */}
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};