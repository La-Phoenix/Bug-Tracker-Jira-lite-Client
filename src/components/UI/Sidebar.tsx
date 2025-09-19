import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bug, 
  FolderOpen, 
  Users, 
  Settings, 
  X,
  BarChart3,
  Tag,
  Clock,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}


export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
  ...(user?.role === 'Admin' ? [{
    name: 'Admin',
    path: '/admin',
    icon: Shield,
    description: 'Admin dashboard'
  }] : []),
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: Home,
    description: 'Overview and stats'
  },
  { 
    name: 'Issues', 
    path: '/issues', 
    icon: Bug,
    description: 'All bug reports'
  },
  { 
    name: 'Projects', 
    path: '/projects', 
    icon: FolderOpen,
    description: 'Project management'
  },
  { 
    name: 'Chat', 
    path: '/chat', 
    icon: MessageSquare,
    description: 'Team communication'
  },
  { 
    name: 'Reports', 
    path: '/reports', 
    icon: BarChart3,
    description: 'Analytics & insights'
  },
  { 
    name: 'Labels', 
    path: '/labels', 
    icon: Tag,
    description: 'Manage labels'
  },
  { 
    name: 'Activity', 
    path: '/activity', 
    icon: Clock,
    description: 'Recent activity'
  },
  { 
    name: 'Team', 
    path: '/team', 
    icon: Users,
    description: 'Team members'
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: Settings,
    description: 'App preferences'
  },
];


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bug className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              BugTrackr
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 pb-20 overflow-y-auto h-full">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)} // Close mobile sidebar on navigation
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                      ${isActive 
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      }
                    `} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.name}</div>
                      <div className={`text-xs truncate ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>BugTrackr Pro v1.0</span>
          </div>
        </div>
      </div>
    </>
  );
};