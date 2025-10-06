import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/UI/Sidebar';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden custom-scrollbar">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex p-4 flex-col min-h-0 lg:ml-64">
        {/* Header - sticky */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content area */}
        <main className="p-4 flex-1 min-h-0 overflow-y-auto h-[100%]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
